import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { PurchaseDialog } from "@/components/PurchaseDialog";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { fetchMarketplaceDecks } from "@/repositories/decksRepository";
import { fetchOwnedDecks } from "@/repositories/libraryRepository";
import { logger, updateLoggerContext, toErrorMetadata } from "@/lib/logger";
import { MarketplaceDeck, MarketplaceDeckCard } from "@/components/MarketplaceDeckCard";
import { Play, Users } from "lucide-react";

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSignedIn, isLoaded } = useAuth();
  const marketplaceLogger = useMemo(
    () => logger.withContext({ screen: "marketplace" }),
    []
  );
  const [userLocale, setUserLocale] = useState<string>("en-US");
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<MarketplaceDeck | null>(null);
  const [purchasedDeckIds, setPurchasedDeckIds] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [purchaseStatusLoading, setPurchaseStatusLoading] = useState(true);
  const [decks, setDecks] = useState<MarketplaceDeck[]>([]);

  const loadDecks = useCallback(async () => {
    marketplaceLogger.info("Fetching marketplace decks");
    try {
      const deckSummaries = await fetchMarketplaceDecks();

      const transformedDecks: MarketplaceDeck[] = deckSummaries.map((deck) => ({
        id: deck.id,
        name: deck.name,
        description: deck.description ?? "",
        theme: deck.theme,
        cardCount: deck.cardCount,
        price: deck.price,
        isPremium: !deck.isFree,
        featured: deck.featured,
        category: deck.category || "Connection",
        plays: deck.plays,
        rating: deck.rating ?? undefined,
        totalRatings: deck.totalRatings ?? undefined,
        thumbnailUrl: deck.thumbnailUrl,
      }));

      const freeDecks = transformedDecks.filter((deck) => !deck.isPremium);
      const premiumDecks = transformedDecks.filter((deck) => deck.isPremium);

      setDecks([...freeDecks, ...premiumDecks]);
      marketplaceLogger.info("Loaded marketplace decks", {
        totalDecks: transformedDecks.length,
        freeDecks: freeDecks.length,
        premiumDecks: premiumDecks.length,
      });
    } catch (error) {
      marketplaceLogger.error("Failed to load decks", {
        error: toErrorMetadata(error),
      });
      toast({
        title: "Error",
        description: "Failed to load decks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [marketplaceLogger, toast]);

  const loadPurchases = useCallback(async () => {
    setPurchaseStatusLoading(true);
    try {
      if (!isSignedIn) {
        setPurchaseStatusLoading(false);
        return;
      }

      const ownedDecks = await fetchOwnedDecks();
      const purchasedIds = new Set<string>(ownedDecks.map((deck) => deck.id));
      setPurchasedDeckIds(purchasedIds);
      marketplaceLogger.info("Loaded purchase history", {
        ownedDecks: purchasedIds.size,
      });
    } catch (error) {
      marketplaceLogger.error("Failed to load purchases", {
        error: toErrorMetadata(error),
      });
    } finally {
      setPurchaseStatusLoading(false);
    }
  }, [isSignedIn, marketplaceLogger]);

  useEffect(() => {
    updateLoggerContext({ screen: "marketplace" });
    marketplaceLogger.info("Marketplace screen mounted");
  }, [marketplaceLogger]);

  useEffect(() => {
    const locale = navigator.language || "en-US";
    setUserLocale(locale);

    marketplaceLogger.debug("Resolved user locale", { locale });

    void loadDecks();
  }, [loadDecks, marketplaceLogger]);

  // Load purchases only after Clerk authentication is ready
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (isSignedIn) {
      marketplaceLogger.info("User signed in; loading purchase history");
      void loadPurchases();
    } else {
      marketplaceLogger.debug("User not signed in; skipping purchase fetch");
      setPurchaseStatusLoading(false);
    }
  }, [isLoaded, isSignedIn, loadPurchases, marketplaceLogger]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(userLocale || "en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPlays = (plays: number) => {
    if (plays >= 1000) {
      return `${(plays / 1000).toFixed(1)}k`;
    }
    return plays.toString();
  };

  const handlePlay = (deckId: string) => {
    navigate(`/game?deck=${deckId}`);
  };

  const handlePurchase = (deck: MarketplaceDeck) => {
    setSelectedDeck(deck);
    setPurchaseDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="relative pt-36 pb-20 px-4 overflow-hidden">
        <div className="container max-w-6xl mx-auto text-center">
          <Link to="/" className="inline-block mb-8 animate-fade-in">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </Button>
          </Link>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-fade-in [animation-delay:200ms]">
            Draw Your Perfect Deck
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in [animation-delay:400ms]">
            From icebreakers to deep dives — discover conversation decks that
            turn any moment into an unforgettable connection.
            <span className="block mt-2 text-primary font-semibold">
              Pick your theme. Shuffle. Play.
            </span>
          </p>

          <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-muted-foreground animate-fade-in [animation-delay:600ms]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary animate-pulse" />
              <span>50K+ Players</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-primary animate-pulse" />
              <span>150K+ Games Played</span>
            </div>
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="py-12 px-4 pb-24">
        <div className="container max-w-7xl mx-auto">
          {loading ? (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="break-inside-avoid mb-6">
                  <div className="rounded-2xl overflow-hidden">
                    <Skeleton className="w-full h-96" />
                  </div>
                </div>
              ))}
            </div>
          ) : decks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No decks available at the moment.
              </p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {decks.map((deck) => (
                <MarketplaceDeckCard
                  key={deck.id}
                  deck={deck}
                  isPurchased={purchasedDeckIds.has(deck.id)}
                  purchaseStatusLoading={purchaseStatusLoading}
                  onPlay={handlePlay}
                  onPurchase={handlePurchase}
                  formatPrice={formatPrice}
                  formatPlays={formatPlays}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedDeck && (
        <PurchaseDialog
          open={purchaseDialogOpen}
          onOpenChange={(open) => {
            setPurchaseDialogOpen(open);
            if (!open) {
              // Reload purchases when dialog closes in case a purchase was made
              loadPurchases();
            }
          }}
          deckId={selectedDeck.id}
          deckName={selectedDeck.name}
          deckDescription={selectedDeck.description}
          price={selectedDeck.price}
          cardCount={selectedDeck.cardCount}
        />
      )}
    </div>
  );
};

export default Marketplace;
