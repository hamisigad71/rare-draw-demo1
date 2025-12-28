import { callSupabaseFunction } from "@/lib/supabaseFunctions";
import { fetchDecksWithCardCounts } from "@/repositories/decksRepository";
import { logger, toErrorMetadata } from "@/lib/logger";

const deckGenerationLogger = logger.withContext({ module: "deck-generation" });

interface GenerateDeckCardsOptions {
  authToken?: string;
  getAuthToken?: () => Promise<string | null>;
  signal?: AbortSignal;
}

async function resolveAuthToken(
  options?: Pick<GenerateDeckCardsOptions, "authToken" | "getAuthToken">
): Promise<string | null> {
  if (options?.getAuthToken) {
    try {
      const freshToken = await options.getAuthToken();
      if (freshToken) {
        return freshToken;
      }
    } catch (error) {
      deckGenerationLogger.warn("Failed to refresh Clerk token before request", {
        error: toErrorMetadata(error),
      });
    }
  }

  return options?.authToken ?? null;
}

export async function generateCardsForDeck(
  deckId: string,
  deckName: string,
  deckTheme: string,
  deckDescription: string,
  cardsToGenerate: number = 50,
  options?: GenerateDeckCardsOptions
) {
  const authToken = await resolveAuthToken(options);

  if (!authToken) {
    throw new Error(
      "A valid Clerk session token is required before generating deck cards. Please sign out and sign back in."
    );
  }

  deckGenerationLogger.info("Generating cards for deck", {
    deckId,
    deckName,
    requestedCards: cardsToGenerate,
  });

  return await callSupabaseFunction("generate-deck-cards", {
    body: {
      deckId,
      deckName,
      deckTheme,
      deckDescription,
      cardsToGenerate,
    },
    authToken,
    signal: options.signal,
  });
}

export async function generateCardsForAllDecks(
  options: GenerateDeckCardsOptions
) {
  const { signal } = options;

  const baseAuthToken = await resolveAuthToken(options);

  if (!baseAuthToken) {
    throw new Error(
      "A valid Clerk session token is required before generating deck cards. Please sign out and sign back in."
    );
  }

  // Get all decks with their current card counts
  deckGenerationLogger.info("Loading decks to evaluate for generation");
  const decks = await fetchDecksWithCardCounts({ authToken: baseAuthToken });

  const results = [];

  for (const deck of decks) {
    try {
      const currentCardCount = deck.cardCount;

      // Only generate for decks with less than 50 cards
      if (currentCardCount >= 50) {
        deckGenerationLogger.debug("Skipping deck; already at capacity", {
          deckId: deck.id,
          currentCardCount,
        });
        results.push({
          deck: deck.name,
          success: true,
          skipped: true,
          currentCount: currentCardCount,
        });
        continue;
      }

      const cardsNeeded = 50 - currentCardCount;

      const freshAuthToken = await resolveAuthToken(options);

      if (!freshAuthToken) {
        deckGenerationLogger.warn("Unable to obtain fresh auth token mid-run", {
          deckId: deck.id,
        });
        throw new Error(
          "Unable to refresh authentication token. Please sign in again."
        );
      }

      deckGenerationLogger.info("Generating cards for deck during bulk run", {
        deckId: deck.id,
        cardsNeeded,
      });

      const result = await generateCardsForDeck(
        deck.id,
        deck.name,
        deck.theme,
        deck.description || "",
        cardsNeeded,
        { authToken: freshAuthToken, signal }
      );

      results.push({
        deck: deck.name,
        success: true,
        result,
        cardsGenerated: cardsNeeded,
        totalCards: 50,
      });

      // Add a small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      deckGenerationLogger.error("Failed to generate cards for deck", {
        deckId: deck.id,
        deckName: deck.name,
        error: toErrorMetadata(error),
      });
      results.push({ deck: deck.name, success: false, error });
    }
  }

  return results;
}
