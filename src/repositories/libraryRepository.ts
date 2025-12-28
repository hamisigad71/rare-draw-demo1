import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { logger, toErrorMetadata } from "@/lib/logger";

export interface OwnedDeckSummary {
  id: string;
  name: string;
  description: string | null;
  theme: string;
  thumbnail_url: string | null;
  category: string | null;
  plays: number;
  card_count: number;
}

type DeckRow = Database["public"]["Tables"]["decks"]["Row"];

type DeckWithCards = DeckRow & {
  cards: Array<{ count: number | null }> | null;
};

type PurchaseRow = Database["public"]["Tables"]["purchases"]["Row"] & {
  decks: DeckWithCards | null;
};

const libraryLogger = logger.withContext({ module: "libraryRepository" });

export async function fetchOwnedDecks(): Promise<OwnedDeckSummary[]> {
  const ownedDecksById = new Map<string, OwnedDeckSummary>();

  const { data: purchasedRows, error: purchasesError } = await supabase
    .from("purchases")
    .select(
      "deck_id, decks(id, name, description, theme, thumbnail_url, category, plays, cards(count))"
    );

  if (purchasesError) {
    libraryLogger.error("Failed to load purchased decks", {
      error: toErrorMetadata(purchasesError),
    });
    throw new Error("Unable to load purchased decks");
  }

  for (const purchase of (purchasedRows ?? []) as PurchaseRow[]) {
    const deck = purchase.decks;

    if (!deck) {
      continue;
    }

    const cardCount = Array.isArray(deck.cards) ? deck.cards[0]?.count ?? 0 : 0;

    ownedDecksById.set(deck.id, {
      id: deck.id,
      name: deck.name,
      description: deck.description ?? null,
      theme: deck.theme,
      thumbnail_url: deck.thumbnail_url ?? null,
      category: deck.category ?? null,
      plays: deck.plays ?? 0,
      card_count: cardCount ?? 0,
    });
  }

  const { data: freeDecks, error: freeDecksError } = await supabase
    .from("decks")
    .select(
      "id, name, description, theme, thumbnail_url, category, plays, cards(count)"
    )
    .eq("is_free", true)
    .eq("is_public", true);

  if (freeDecksError) {
    libraryLogger.error("Failed to load free decks", {
      error: toErrorMetadata(freeDecksError),
    });
    throw new Error("Unable to load free decks");
  }

  for (const deck of (freeDecks ?? []) as DeckWithCards[]) {
    const cardCount = Array.isArray(deck.cards) ? deck.cards[0]?.count ?? 0 : 0;

    if (!ownedDecksById.has(deck.id)) {
      ownedDecksById.set(deck.id, {
        id: deck.id,
        name: deck.name,
        description: deck.description ?? null,
        theme: deck.theme,
        thumbnail_url: deck.thumbnail_url ?? null,
        category: deck.category ?? null,
        plays: deck.plays ?? 0,
        card_count: cardCount ?? 0,
      });
    }
  }

  return Array.from(ownedDecksById.values());
}
