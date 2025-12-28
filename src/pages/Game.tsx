import React from "react";
const { useState, useEffect, useCallback, useRef, useMemo } = React;
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Sparkles, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { callSupabaseFunction } from "@/lib/supabaseFunctions";
import { logger, updateLoggerContext, toErrorMetadata } from "@/lib/logger";
import {
  DeckCardRecord,
  DeckRecord,
  fetchDeckDetails,
} from "@/repositories/decksRepository";
import { useDeckImage } from "@/hooks/useDeckImage";

interface CardData {
  id: string;
  description: string;
  action_type: string;
  order_index: number;
  suggester_nickname?: string | null;
  isEndCard?: boolean;
}

interface LeavingCardState {
  card: CardData;
  direction: "left" | "right";
  index: number;
}

interface SessionCardPlay {
  cardId: string;
  action: "completed" | "passed";
  playedAt: string;
}

const EASE_OUT_BEZIER: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const EASE_EXIT_BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

type DeckData = Pick<
  DeckRecord,
  "id" | "name" | "theme" | "is_free" | "price" | "thumbnail_url"
>;

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isLoaded, isSignedIn, user: clerkUser, getAuthToken } = useAuth();
  const deckId =
    searchParams.get("deck") || "a0000000-0000-0000-0000-000000000001";
  const userId = clerkUser?.id ?? null;

  const [deck, setDeck] = useState<DeckData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [baseCards, setBaseCards] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [deckCardCount, setDeckCardCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [leavingCard, setLeavingCard] = useState<LeavingCardState | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [sessionStartAt, setSessionStartAt] = useState<string | null>(null);
  const [hasSubmittedResults, setHasSubmittedResults] = useState(false);
  const [cardHistory, setCardHistory] = useState<
    Array<{ index: number; direction: "left" | "right" }>
  >([]);
  const sessionSubmissionRef = useRef(false);
  const sessionPlaysRef = useRef<SessionCardPlay[]>([]);
  const sessionIdRef = useRef<string | null>(null);
  const lastUserIdRef = useRef<string | null>(null);

  const gameLogger = useMemo(
    () => logger.withContext({ screen: "game", deckId }),
    [deckId]
  );

  // Call useDeckImage hook before any conditional returns to maintain hook order
  const { imageSrc: deckImage } = useDeckImage({
    thumbnailUrl: deck?.thumbnail_url,
    theme: deck?.theme,
    name: deck?.name,
  });

  useEffect(() => {
    updateLoggerContext({ screen: "game", deckId });
  }, [deckId]);

  useEffect(() => {
    updateLoggerContext({ userId });

    if (lastUserIdRef.current !== userId) {
      if (userId) {
        gameLogger.info("Linked signed-in user to game session", { userId });
      } else if (lastUserIdRef.current) {
        gameLogger.info("User signed out during game session", {
          previousUserId: lastUserIdRef.current,
        });
      }

      lastUserIdRef.current = userId;
    }
  }, [gameLogger, userId]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacityValue = useMotionValue(1);
  const rotate = useTransform(x, [-320, 0, 320], [-18, 0, 18]);

  const startNewSession = useCallback(() => {
    const nowIso = new Date().toISOString();
    const newSessionId = `${deckId}-${Date.now()}`;

    setSessionStartAt(nowIso);
    setHasSubmittedResults(false);
    setCardHistory([]);
    sessionSubmissionRef.current = false;
    sessionPlaysRef.current = [];
    sessionIdRef.current = newSessionId;

    updateLoggerContext({ currentGameSessionId: newSessionId });

    gameLogger.info("Started new game session", {
      deckId,
      sessionId: newSessionId,
      startedAt: nowIso,
    });
  }, [deckId, gameLogger]);

  // Fisher-Yates shuffle algorithm
  const shuffleCards = useCallback((cards: CardData[]): CardData[] => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const createEndCard = useCallback(
    (): CardData => ({
      id: `end-card-${deckId}`,
      description: "",
      action_type: "end",
      order_index: 9999,
      isEndCard: true,
    }),
    [deckId]
  );

  const loadGame = useCallback(async () => {
    gameLogger.info("Loading deck data", { deckId, userId });

    setLoading(true);
    setCheckingAccess(true);
    setHasAccess(false);
    setDeckCardCount(0);

    try {
      let authToken: string | undefined;

      if (isSignedIn) {
        try {
          authToken = (await getAuthToken()) ?? undefined;

          if (!authToken) {
            gameLogger.warn(
              "Signed-in user missing auth token for deck fetch",
              {
                deckId,
                userId,
              }
            );
          }
        } catch (tokenError) {
          gameLogger.warn("Failed to retrieve auth token", {
            deckId,
            userId,
            error: toErrorMetadata(tokenError),
          });
        }
      }

      const {
        deck: deckData,
        cards: cardsData,
        hasAccess: accessGranted,
        cardCount,
      } = await fetchDeckDetails(deckId, { authToken });

      if (!deckData) {
        gameLogger.warn("Deck not found when loading game", { deckId });
        toast({
          title: "Deck not found",
          description: "The requested deck could not be found.",
          variant: "destructive",
        });
        navigate("/marketplace");
        return;
      }

      gameLogger.info("Deck details retrieved", {
        deckId,
        cardCount: cardCount ?? cardsData?.length ?? 0,
        hasAccess: accessGranted,
        isFree: deckData.is_free,
      });

      setDeck({
        id: deckData.id,
        name: deckData.name,
        theme: deckData.theme,
        is_free: deckData.is_free,
        price: deckData.price,
        thumbnail_url: deckData.thumbnail_url ?? null,
      });

      setDeckCardCount(cardCount ?? 0);
      setHasAccess(accessGranted);

      const canPlayDeck = deckData.is_free || accessGranted;

      if (canPlayDeck) {
        try {
          await callSupabaseFunction("increment-deck-plays", {
            method: "POST",
            body: { deckId },
          });
          gameLogger.debug("Incremented deck play count", { deckId });
        } catch (playCountError) {
          gameLogger.warn("Unable to increment deck play count", {
            deckId,
            error: toErrorMetadata(playCountError),
          });
        }
      }

      if (!canPlayDeck) {
        gameLogger.info("User lacks access to deck", {
          deckId,
          isFreeDeck: deckData.is_free,
          hasPurchase: accessGranted,
        });
        setBaseCards([]);
        setCards([]);
        setCurrentCardIndex(0);
        setScore(0);
        setPassed(0);
        return;
      }

      const normalizedCards: CardData[] = (cardsData ?? []).map(
        (card: DeckCardRecord) => ({
          id: card.id,
          description: card.description ?? "",
          action_type: card.action_type,
          order_index: card.order_index ?? 0,
          suggester_nickname: (card as any).suggester_nickname ?? null,
          isEndCard: false,
        })
      );

      const shuffledCards = shuffleCards(normalizedCards);
      const gameCards = shuffledCards.slice(0, 50).map((card) => ({
        ...card,
        isEndCard: false,
      }));

      const cardsWithEndCard = [...gameCards, createEndCard()];

      setBaseCards(gameCards);
      setCards(cardsWithEndCard);
      setCurrentCardIndex(0);
      setScore(0);
      setPassed(0);
      setLeavingCard(null);
      setSwipeDirection(null);
      x.set(0);
      y.set(0);
      opacityValue.set(1);
      startNewSession();

      gameLogger.info("Deck ready for play", {
        deckId,
        totalCards: cardsWithEndCard.length,
        playableCards: gameCards.length,
      });
    } catch (error: any) {
      gameLogger.error("Error loading game", {
        deckId,
        error: toErrorMetadata(error),
      });
      setDeckCardCount(0);
      toast({
        title: "Error loading game",
        description: error?.message ?? "Unable to load this deck.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      gameLogger.debug("Finished deck load attempt", { deckId });
      setCheckingAccess(false);
      setLoading(false);
    }
  }, [
    createEndCard,
    deckId,
    gameLogger,
    getAuthToken,
    isSignedIn,
    navigate,
    opacityValue,
    shuffleCards,
    startNewSession,
    toast,
    userId,
    x,
    y,
  ]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    void loadGame();
  }, [isLoaded, loadGame]);

  const handleSwipe = (direction: "left" | "right") => {
    if (isAnimating) {
      gameLogger.debug("Swipe ignored while animation is in progress", {
        deckId,
        direction,
      });
      return;
    }

    const card = cards[currentCardIndex];
    if (!card || card.isEndCard) {
      gameLogger.debug("Swipe ignored because card is not playable", {
        deckId,
        direction,
        currentCardId: card?.id ?? null,
      });
      return;
    }

    const nextIndex = Math.min(currentCardIndex + 1, cards.length - 1);

    gameLogger.info("Player swiped card", {
      deckId,
      direction,
      cardId: card.id,
      nextIndex,
      sessionId: sessionIdRef.current,
    });

    setIsAnimating(true);
    setSwipeDirection(direction);
    setLeavingCard({ card, direction, index: currentCardIndex });

    // Track card history for back navigation
    setCardHistory((prev) => [...prev, { index: currentCardIndex, direction }]);

    if (direction === "right") {
      setScore((prev) => prev + 1);
    } else {
      setPassed((prev) => prev + 1);
    }

    sessionPlaysRef.current.push({
      cardId: card.id,
      action: direction === "right" ? "completed" : "passed",
      playedAt: new Date().toISOString(),
    });

    x.set(0);
    y.set(24);
    opacityValue.set(0);
    setCurrentCardIndex(nextIndex);

    gameLogger.debug("Prepared next card after swipe", {
      deckId,
      nextIndex,
    });
  };

  const handleDidIt = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    handleSwipe("right");
  };

  const handlePass = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    handleSwipe("left");
  };

  const handleGoBack = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (isAnimating || cardHistory.length === 0) {
      gameLogger.debug("Go back ignored", {
        deckId,
        isAnimating,
        historyLength: cardHistory.length,
      });
      return;
    }

    const lastCard = cardHistory[cardHistory.length - 1];
    const previousIndex = lastCard.index;

    gameLogger.info("Player navigated back to previous card", {
      deckId,
      fromIndex: currentCardIndex,
      toIndex: previousIndex,
      previousDirection: lastCard.direction,
    });

    // Remove last item from history
    setCardHistory((prev) => prev.slice(0, -1));

    // Restore previous state
    if (lastCard.direction === "right") {
      setScore((prev) => Math.max(0, prev - 1));
    } else {
      setPassed((prev) => Math.max(0, prev - 1));
    }

    // Remove last session play
    if (sessionPlaysRef.current.length > 0) {
      sessionPlaysRef.current = sessionPlaysRef.current.slice(0, -1);
    }

    setCurrentCardIndex(previousIndex);
    setLeavingCard(null);
    setSwipeDirection(null);
    setIsAnimating(false);
    x.set(0);
    y.set(0);
    opacityValue.set(1);

    gameLogger.debug("Restored state to previous card", {
      deckId,
      index: previousIndex,
    });
  };

  const playAgain = () => {
    if (baseCards.length === 0) {
      gameLogger.warn(
        "Cannot restart session because no base cards are available",
        {
          deckId,
        }
      );
      return;
    }

    const reshuffled = shuffleCards(baseCards).map((card) => ({
      ...card,
      isEndCard: false,
    }));

    const cardsWithEnd = [...reshuffled, createEndCard()];

    setCards(cardsWithEnd);
    setCurrentCardIndex(0);
    setScore(0);
    setPassed(0);
    setCardHistory([]);
    setLeavingCard(null);
    setSwipeDirection(null);
    setIsAnimating(false);
    x.set(0);
    y.set(0);
    opacityValue.set(1);
    startNewSession();

    gameLogger.info("Restarted deck session", {
      deckId,
      totalCards: cardsWithEnd.length,
    });
  };

  const handleExitComplete = () => {
    setLeavingCard(null);
    setSwipeDirection(null);
    setIsAnimating(false);

    x.set(0);
    y.set(0);
    opacityValue.set(1);

    setSwipeDirection(null);

    gameLogger.debug("Completed card exit animation", {
      deckId,
    });
  };

  const totalCards = cards ? cards.length : 0;
  const totalPlayableCards = Math.max(totalCards - 1, 0);
  const totalForDisplay = Math.max(totalPlayableCards, score + passed);
  const currentCard =
    currentCardIndex < totalCards ? cards[currentCardIndex] : null;
  const isEndCard = currentCard?.isEndCard ?? false;
  const displayIndex = isEndCard
    ? totalPlayableCards
    : Math.min(currentCardIndex + 1, totalPlayableCards);
  const progress = totalPlayableCards
    ? (Math.min(
        isEndCard ? totalPlayableCards : currentCardIndex + 1,
        totalPlayableCards
      ) /
        totalPlayableCards) *
      100
    : 0;
  const leavingCardDisplayIndex = leavingCard
    ? Math.min(leavingCard.index + 1, totalPlayableCards)
    : 0;
  const leavingCardProgress = leavingCard
    ? totalPlayableCards
      ? (leavingCardDisplayIndex / totalPlayableCards) * 100
      : 0
    : 0;

  const foregroundBlur = currentCard?.isEndCard ? "blur(10px)" : "blur(20px)";
  const leavingCardBlur = leavingCard?.card.isEndCard
    ? "blur(10px)"
    : "blur(20px)";

  const submitGameSession = useCallback(async () => {
    if (hasSubmittedResults || sessionSubmissionRef.current) {
      return;
    }

    if (!deckId) {
      return;
    }

    sessionSubmissionRef.current = true;
    const finishedAt = new Date().toISOString();
    const sessionId = sessionIdRef.current;

    gameLogger.info("Submitting game session", {
      deckId,
      sessionId,
      score,
      passed,
      totalPlayableCards,
      startedAt: sessionStartAt,
      finishedAt,
      eventsRecorded: sessionPlaysRef.current.length,
    });

    try {
      await callSupabaseFunction("record-game-session", {
        body: {
          deckId,
          userId,
          completedCount: score,
          passedCount: passed,
          totalCards: totalPlayableCards,
          startedAt: sessionStartAt ?? finishedAt,
          finishedAt,
          cardPlays: sessionPlaysRef.current.map((event) => ({
            cardId: event.cardId,
            action: event.action,
            playedAt: event.playedAt,
          })),
        },
      });

      setHasSubmittedResults(true);
      gameLogger.info("Game session recorded", {
        deckId,
        sessionId,
        finishedAt,
      });
    } catch (error: any) {
      gameLogger.error("Failed to record game session", {
        deckId,
        sessionId,
        error: toErrorMetadata(error),
      });
      toast({
        title: "Unable to save session",
        description:
          error instanceof Error
            ? error.message
            : "We couldn't record your session stats.",
        variant: "destructive",
      });
    }
  }, [
    deckId,
    gameLogger,
    hasSubmittedResults,
    passed,
    score,
    sessionStartAt,
    toast,
    totalPlayableCards,
    userId,
  ]);

  useEffect(() => {
    if (isEndCard && !hasSubmittedResults) {
      void submitGameSession();
    }
  }, [isEndCard, hasSubmittedResults, submitGameSession]);

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your deck...</p>
        </div>
      </div>
    );
  }

  // Show access denied screen for premium decks without purchase
  if (deck && !deck.is_free && !hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Premium Deck</h2>
              <p className="text-muted-foreground">
                This is a premium deck. Purchase it to unlock all{" "}
                {deckCardCount} cards and start playing!
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">${deck.price}</p>
              <p className="text-sm text-muted-foreground">One-time purchase</p>
            </div>
            <div className="space-y-2">
              <Button
                size="lg"
                onClick={() => navigate("/marketplace")}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Go to Marketplace
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!deck || !cards || cards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No cards found in this deck.
            </p>
            <Button onClick={() => navigate("/")} className="w-full mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderCardForeground = (
    card: CardData,
    cardDisplayIndex: number,
    progressValue: number,
    totalPlayableCount: number
  ) => {
    if (card.isEndCard) {
      return (
        <div className="relative h-full flex flex-col items-center justify-center px-8 text-center gap-10">
          <div className="w-full max-w-sm mx-auto">
            <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary rounded-full transition-all duration-300"
                style={{ width: `${Math.max(progressValue, 0)}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Deck Complete
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              That&apos;s the end of this deck!
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Ready for another round? Shuffle the prompts for a fresh game or
              check out more decks in the marketplace.
            </p>
            <div className="grid gap-3 w-full max-w-sm mx-auto text-left sm:text-center">
              <div className="rounded-xl bg-primary/10 border border-primary/15 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                  Completed
                </p>
                <p className="text-2xl font-bold text-primary">
                  {score} / {totalForDisplay || 0}
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                  Passed
                </p>
                <p className="text-2xl font-semibold text-muted-foreground">
                  {passed}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const cappedDisplayIndex = Math.max(cardDisplayIndex, 1);
    const totalLabel = Math.max(totalPlayableCount, 1);

    return (
      <div className="relative flex h-full flex-col">
        <div className="px-6 pt-6 pb-5 sm:px-8 sm:pt-8">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-300"
              style={{ width: `${progressValue}%` }}
            ></div>
          </div>
        </div>

        <div className="flex-1 px-6 pb-6 sm:px-8 sm:pb-10">
          <Badge
            variant="outline"
            className="mb-5 inline-flex border-primary bg-primary px-3 py-1 text-sm text-primary-foreground shadow-sm dark:border-primary/70 dark:bg-primary/80"
          >
            {card.action_type === "dare" ? "Challenge" : "Question"}{" "}
            {cappedDisplayIndex} of {totalLabel}
          </Badge>

          <div className="flex h-full flex-col gap-3 sm:gap-5">
            {card.description && (
              <div className="flex overflow-auto">
                <p className="text-balance text-2xl font-bold leading-snug text-foreground sm:text-3xl">
                  {card.description}
                </p>
              </div>
            )}

            {card.suggester_nickname && (
              <div className="flex-auto justify-end">
                <p className="max-w-full text-right text-base text-muted-foreground font-bold italic sm:text-lg">
                  by @{card.suggester_nickname}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const deckTitle = deck.name;
  const deckThemeLabel = deck.theme;

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 relative overflow-x-hidden">
      {/* Exit Button */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 w-12 h-12 bg-card/90 backdrop-blur-sm rounded-xl shadow-card flex items-center justify-center hover:scale-110 transition-transform z-20 border border-border"
      >
        <X className="w-6 h-6 text-foreground" strokeWidth={2.5} />
      </button>

      <header className="mt-16 mb-6 flex flex-col items-center gap-3 text-center">
        {deckThemeLabel && (
          <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1 text-sm uppercase tracking-wider">
            {deckThemeLabel}
          </Badge>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {deckTitle}
        </h1>
      </header>

      {/* Main Card Container with Stacked Effect */}
      <div
        className="w-full max-w-md mx-auto relative mt-8"
        style={{ height: "500px" }}
      >
        {currentCardIndex + 2 < totalCards && (
          <motion.div
            className="absolute inset-0 rounded-[2.5rem] shadow-card border border-border overflow-hidden"
            animate={{
              y: swipeDirection ? -4 : -14,
              scale: swipeDirection ? 0.985 : 0.94,
              opacity: swipeDirection ? 0.55 : 0.4,
            }}
            transition={{ duration: 0.32, ease: [0.2, 0.8, 0.4, 1] }}
            style={{ zIndex: 1 }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center blur-xl"
              style={{ backgroundImage: `url(${deckImage})` }}
            ></div>
            <div className="absolute inset-0 bg-background/60"></div>
          </motion.div>
        )}

        {currentCardIndex + 1 < totalCards && (
          <motion.div
            className="absolute inset-0 rounded-[2.5rem] shadow-card border border-border overflow-hidden"
            animate={{
              y: swipeDirection ? 0 : -8,
              scale: swipeDirection ? 1 : 0.97,
              opacity: swipeDirection ? 1 : 0.75,
            }}
            transition={{ duration: 0.32, ease: [0.2, 0.8, 0.4, 1] }}
            style={{ zIndex: 2 }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center blur-xl"
              style={{ backgroundImage: `url(${deckImage})` }}
            ></div>
            <div className="absolute inset-0 bg-background/60"></div>
          </motion.div>
        )}

        {leavingCard && (
          <motion.div
            key={`leaving-${leavingCard.card.id}-${leavingCard.index}-${leavingCard.direction}`}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: leavingCard.direction === "right" ? 520 : -520,
              y: -40,
              opacity: 0,
              rotate: leavingCard.direction === "right" ? 18 : -18,
            }}
            transition={{ duration: 0.32, ease: EASE_EXIT_BEZIER }}
            onAnimationComplete={handleExitComplete}
            className="absolute inset-0 rounded-[2.5rem] shadow-2xl overflow-hidden border border-border pointer-events-none"
            style={{ zIndex: 4 }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${deckImage})`,
                filter: leavingCardBlur,
              }}
            ></div>
            <div className="absolute inset-0 bg-background/70"></div>

            {renderCardForeground(
              leavingCard.card,
              leavingCardDisplayIndex,
              leavingCardProgress,
              totalPlayableCards
            )}
          </motion.div>
        )}

        {currentCard && (
          <motion.div
            key={currentCard.id}
            whileTap={{ scale: 0.98 }}
            className="absolute inset-0 rounded-[2.5rem] shadow-2xl overflow-hidden border border-border"
            style={{ x, y, opacity: opacityValue, rotate, zIndex: 3 }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${deckImage})`,
                filter: foregroundBlur,
              }}
            ></div>
            <div className="absolute inset-0 bg-background/70"></div>

            {renderCardForeground(
              currentCard,
              displayIndex,
              progress,
              totalPlayableCards
            )}
          </motion.div>
        )}
      </div>

      {/* Action Buttons - Outside card at bottom */}
      <div className="w-full max-w-md mx-auto mt-10 mb-4">
        {currentCard?.isEndCard ? (
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={playAgain}
              className="w-full flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" /> Play Again
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/marketplace")}
              className="w-full"
            >
              Quit to Marketplace
            </Button>
          </div>
        ) : (
          <div className="flex justify-center items-center gap-8">
            {/* Thumbs Down - Pass */}
            <button
              type="button"
              onClick={handlePass}
              className={`w-20 h-20 bg-card rounded-full shadow-card border-4 border-border hover:border-destructive/50 hover:scale-110 transition-all duration-200 active:scale-95 select-none ${
                isAnimating ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="flex flex-col items-center gap-1 text-sm font-semibold tracking-wide select-none">
                <span className="text-3xl" role="img" aria-label="Thumbs down">
                  👎
                </span>
                Pass
              </span>
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={handleGoBack}
              disabled={cardHistory.length === 0}
              className={`w-14 h-14 bg-card rounded-full shadow-card border-2 border-border hover:border-primary/50 hover:scale-110 transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center select-none ${
                isAnimating ? "opacity-30 cursor-not-allowed" : ""
              }`}
              aria-label="Go back to previous card"
            >
              <RotateCcw className="w-6 h-6 text-muted-foreground" />
            </button>

            {/* Thumbs Up - Did It */}
            <button
              type="button"
              onClick={handleDidIt}
              className={`w-20 h-20 bg-card rounded-full shadow-card border-4 border-border hover:border-primary/50 hover:scale-110 transition-all duration-200 active:scale-95 select-none ${
                isAnimating ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="flex flex-col items-center gap-1 text-sm font-semibold tracking-wide select-none">
                <span className="text-3xl" role="img" aria-label="Thumbs up">
                  👍
                </span>
                Done
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
