import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  generateCardsForAllDecks,
  generateCardsForDeck,
} from "@/lib/generateDeckCards";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { fetchDecksWithCardCounts } from "@/repositories/decksRepository";
import { logger, updateLoggerContext, toErrorMetadata } from "@/lib/logger";

type DeckSummary = {
  id: string;
  name: string;
  theme?: string | null;
  description?: string | null;
  cardCount: number;
};

export default function AdminCardGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("all");
  const [cardsToGenerateInput, setCardsToGenerateInput] =
    useState<string>("50");
  const { toast } = useToast();
  const { getAuthToken, isSignedIn, isLoaded } = useAuth();
  const generationLogger = useMemo(
    () => logger.withContext({ screen: "admin-card-generation" }),
    []
  );

  useEffect(() => {
    updateLoggerContext({ screen: "admin-card-generation" });
    generationLogger.info("Admin card generation screen mounted");
  }, [generationLogger]);

  useEffect(() => {
    let isMounted = true;

    const loadDecks = async () => {
      if (!isLoaded) {
        generationLogger.debug("Skipping deck load; auth not ready");
        return;
      }

      if (!isSignedIn) {
        if (isMounted) {
          setDecks([]);
          setIsLoadingDecks(false);
        }
        generationLogger.debug("Skipping deck load; user not signed in");
        return;
      }

      setIsLoadingDecks(true);
      generationLogger.info("Loading decks for admin generation");
      try {
        const token = await getAuthToken();

        if (!token) {
          throw new Error("Unable to obtain admin authorization token.");
        }

        const deckList = await fetchDecksWithCardCounts({ authToken: token });
        if (isMounted) {
          setDecks(deckList);
        }
        generationLogger.info("Loaded decks for admin generation", {
          deckCount: deckList.length,
        });
      } catch (error) {
        generationLogger.error("Failed to load decks for generation", {
          error: toErrorMetadata(error),
        });
        if (isMounted) {
          toast({
            title: "Unable to load decks",
            description: "Please refresh the page and try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingDecks(false);
        }
        generationLogger.debug("Deck load attempt finished");
      }
    };

    loadDecks();

    return () => {
      isMounted = false;
    };
  }, [generationLogger, getAuthToken, isLoaded, isSignedIn, toast]);

  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.id === selectedDeckId) ?? null,
    [decks, selectedDeckId]
  );

  const isSingleDeckMode = selectedDeckId !== "all";

  const requestedCardCount = useMemo(() => {
    const parsed = Number.parseInt(cardsToGenerateInput, 10);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [cardsToGenerateInput]);

  const canSubmitSingleDeck = !isSingleDeckMode
    ? true
    : Boolean(
        selectedDeck &&
          Number.isFinite(requestedCardCount) &&
          requestedCardCount > 0 &&
          requestedCardCount <= 200
      );

  const isActionButtonDisabled =
    isGenerating || isLoadingDecks || !canSubmitSingleDeck;

  const buttonLabel = isSingleDeckMode
    ? "Generate Cards for Selected Deck"
    : "Generate Cards for All Decks";

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResults([]);

    generationLogger.info("Admin initiated card generation", {
      mode: isSingleDeckMode ? "single" : "bulk",
      selectedDeckId,
    });

    try {
      if (!isLoaded) {
        generationLogger.warn("Card generation attempted before auth ready");
        throw new Error(
          "Authentication status is not ready yet. Please try again."
        );
      }

      if (!isSignedIn) {
        generationLogger.warn("Card generation attempted while signed out");
        throw new Error("You must be signed in before generating cards.");
      }

      const token = await getAuthToken();

      if (!token) {
        generationLogger.warn("Missing token for admin generation run");
        throw new Error(
          "Unable to obtain a Clerk session token. Please re-authenticate and try again."
        );
      }

      if (isSingleDeckMode) {
        const deckToUpdate = selectedDeck;

        if (!deckToUpdate) {
          generationLogger.error("Single-deck generation requested with no selection");
          throw new Error("Please select a deck to generate cards for.");
        }

        if (!Number.isFinite(requestedCardCount) || requestedCardCount <= 0) {
          throw new Error("Enter a positive number of cards to generate.");
        }

        if (requestedCardCount > 200) {
          throw new Error(
            "Please request 200 cards or fewer at a time to keep generation reliable."
          );
        }

        toast({
          title: `Generating cards for ${deckToUpdate.name}`,
          description: `Creating approximately ${requestedCardCount} new prompts...`,
        });

        generationLogger.info("Starting single-deck generation", {
          deckId: deckToUpdate.id,
          requestedCardCount,
        });

        const generationResult = await generateCardsForDeck(
          deckToUpdate.id,
          deckToUpdate.name,
          deckToUpdate.theme ?? "",
          deckToUpdate.description ?? "",
          requestedCardCount,
          { authToken: token, getAuthToken }
        );

        const generatedCountRaw = (generationResult as any)?.cardsGenerated;
        const generatedCount = Number.isFinite(Number(generatedCountRaw))
          ? Number(generatedCountRaw)
          : requestedCardCount;
        const startingCount = deckToUpdate.cardCount;
        const updatedTotal = startingCount + generatedCount;

        setResults([
          {
            deck: deckToUpdate.name,
            success: (generationResult as any)?.success ?? true,
            cardsGenerated: generatedCount,
            totalCards: updatedTotal,
            requested: requestedCardCount,
          },
        ]);

        setDecks((prev) =>
          prev.map((deck) =>
            deck.id === deckToUpdate.id
              ? { ...deck, cardCount: updatedTotal }
              : deck
          )
        );

        toast({
          title: "Card generation complete",
          description: `Generated ${generatedCount} new cards for ${deckToUpdate.name}.`,
        });

        generationLogger.info("Completed single-deck generation", {
          deckId: deckToUpdate.id,
          generatedCount,
          totalCards: updatedTotal,
        });
      } else {
        toast({
          title: "Starting card generation",
          description: "This may take a few minutes...",
        });

        generationLogger.info("Starting bulk generation for all decks");

        const generationResults = await generateCardsForAllDecks({
          authToken: token,
          getAuthToken,
        });
        setResults(generationResults);

        const successCount = generationResults.filter((r) => r.success).length;
        const failCount = generationResults.filter((r) => !r.success).length;

        toast({
          title: "Card generation complete",
          description: `Success: ${successCount} decks, Failed: ${failCount} decks`,
        });

        generationLogger.info("Completed bulk generation", {
          successCount,
          failCount,
        });

        try {
          const refreshToken = await getAuthToken();
          if (!refreshToken) {
            generationLogger.warn(
              "Unable to refresh deck list after generation; missing token"
            );
            throw new Error(
              "Unable to refresh deck list without authentication."
            );
          }

          const refreshedDecks = await fetchDecksWithCardCounts({
            authToken: refreshToken,
          });
          setDecks(refreshedDecks);
          generationLogger.debug("Refreshed deck list after generation", {
            deckCount: refreshedDecks.length,
          });
        } catch (refreshError) {
          generationLogger.error(
            "Unable to refresh deck list after generation",
            {
              error: toErrorMetadata(refreshError),
            }
          );
        }
      }
    } catch (error) {
      generationLogger.error("Card generation failed", {
        error: toErrorMetadata(error),
      });

      let errorMessage = "Failed to generate cards";
      if (error instanceof Error) {
        errorMessage = error.message;

        // Check for authentication errors
        if (
          error.message.includes("Authentication failed") ||
          error.message.includes("Unable to verify")
        ) {
          errorMessage =
            "Session expired. Please sign out and sign back in to continue.";
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      generationLogger.debug("Card generation handler finished");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Generate Deck Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Card Generation</AlertTitle>
            <AlertDescription>
              Choose a specific deck to generate new OpenAI-powered prompts or
              keep "All decks" selected to top up every deck to 50 cards. Longer
              runs may take several minutes to complete.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Deck</label>
              <Select
                value={selectedDeckId}
                onValueChange={(value) => {
                  setSelectedDeckId(value);
                }}
              >
                <SelectTrigger disabled={isGenerating || isLoadingDecks}>
                  <SelectValue
                    placeholder={
                      isLoadingDecks ? "Loading decks..." : "Choose a deck"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All decks (auto-fill to 50 cards)
                  </SelectItem>
                  {isLoadingDecks ? (
                    <SelectItem value="loading" disabled>
                      Loading decks...
                    </SelectItem>
                  ) : decks.length > 0 ? (
                    decks.map((deck) => (
                      <SelectItem key={deck.id} value={deck.id}>
                        {deck.name} · {deck.cardCount} cards
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>
                      No decks available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {isSingleDeckMode && selectedDeck && (
                <p className="text-xs text-muted-foreground">
                  Currently {selectedDeck.cardCount} cards
                  {selectedDeck.theme ? ` · Theme: ${selectedDeck.theme}` : ""}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cards to generate</label>
              <Input
                type="number"
                min={1}
                max={200}
                value={cardsToGenerateInput}
                onChange={(event) =>
                  setCardsToGenerateInput(event.target.value)
                }
                disabled={!isSingleDeckMode || isGenerating}
                placeholder="Enter quantity"
              />
              <p className="text-xs text-muted-foreground">
                {isSingleDeckMode
                  ? "Request between 1 and 200 cards per run."
                  : "Select a specific deck to customize the amount."}
              </p>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isActionButtonDisabled}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating cards...
              </>
            ) : (
              buttonLabel
            )}
          </Button>

          {results.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="font-semibold">Results:</h3>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    result.success
                      ? result.skipped
                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                        : "bg-green-500/10 text-green-700 dark:text-green-400"
                      : "bg-red-500/10 text-red-700 dark:text-red-400"
                  }`}
                >
                  <div className="font-medium">{result.deck}</div>
                  <div className="text-sm">
                    {result.success
                      ? result.skipped
                        ? `⊙ Skipped - Already has ${result.currentCount} cards`
                        : `✓ Generated ${result.cardsGenerated} cards (Total: ${result.totalCards})`
                      : `✗ Failed: ${result.error?.message || "Unknown error"}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
