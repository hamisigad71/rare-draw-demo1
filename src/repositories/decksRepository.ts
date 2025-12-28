import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { logger, toErrorMetadata } from "@/lib/logger";
import { callSupabaseFunction } from "@/lib/supabaseFunctions";

export interface DeckSummary {
  id: string;
  name: string;
  description: string | null;
  theme: string;
  price: number;
  isFree: boolean;
  category: string | null;
  featured: boolean;
  plays: number;
  rating: number | null;
  totalRatings: number | null;
  cardCount: number;
  thumbnailUrl: string | null;
}

export interface DeckRecord {
  id: string;
  name: string;
  theme: string;
  is_free: boolean;
  price: number;
  category: string | null;
  featured: boolean;
  plays: number;
  description: string | null;
  rating: number | null;
  total_ratings: number | null;
  thumbnail_url?: string | null;
  is_public?: boolean | null;
  creator_id?: string | null;
}

export interface DeckCardRecord {
  id: string;
  description: string | null;
  action_type: string;
  order_index: number | null;
  deck_id: string;
  suggester_nickname?: string | null;
}

export interface PublicDeckStats {
  totalPublicDecks: number;
  totalCards: number;
  freeDeckId: string | null;
}

export interface DeckWithCardCount {
  id: string;
  name: string;
  theme: string;
  description: string | null;
  cardCount: number;
}

export interface DeckDetailsResponse {
  deck: DeckRecord;
  cards: DeckCardRecord[];
  cardCount: number;
  hasAccess: boolean;
}

type DeckRow = Database["public"]["Tables"]["decks"]["Row"];

type DeckWithCardAggregate = DeckRow & {
  cards: Array<{ count: number | null }> | null;
};

type DeckWithCardCountViewRow = {
  deck_id: string;
  name: string;
  description: string | null;
  theme: string;
  category: string | null;
  thumbnail_url: string | null;
  price: number | null;
  is_free: boolean | null;
  is_public: boolean | null;
  featured: boolean | null;
  plays: number | null;
  rating: number | null;
  total_ratings: number | null;
  creator_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  card_count: number | null;
};

const decksLogger = logger.withContext({ module: "decksRepository" });

export async function fetchMarketplaceDecks(): Promise<DeckSummary[]> {
  const { data, error } = await supabase
    .from("deck_card_counts")
    .select(
      "deck_id, name, description, theme, category, thumbnail_url, price, is_free, is_public, featured, plays, rating, total_ratings, card_count"
    )
    .eq("is_public", true)
    .order("featured", { ascending: false })
    .order("plays", { ascending: false });

  if (error) {
    decksLogger.error("Failed to load marketplace decks", {
      error: toErrorMetadata(error),
    });
    throw new Error("Unable to load marketplace decks");
  }

  const decks = (data ?? []) as DeckWithCardCountViewRow[];

  return decks.map((deck) => {
    const cardCount = deck.card_count ?? 0;

    return {
      id: deck.deck_id,
      name: deck.name,
      description: deck.description ?? null,
      theme: deck.theme,
      price: Number(deck.price ?? 0),
      isFree: deck.is_free ?? false,
      category: deck.category ?? null,
      featured: deck.featured ?? false,
      plays: deck.plays ?? 0,
      rating: deck.rating ?? null,
      totalRatings: deck.total_ratings ?? null,
      cardCount,
      thumbnailUrl: deck.thumbnail_url ?? null,
    } satisfies DeckSummary;
  });
}

export async function fetchDeckById(
  deckId: string,
  options: { authToken?: string } = {}
): Promise<DeckRecord | null> {
  const details = await fetchDeckDetails(deckId, options);
  return details.deck ?? null;
}

export async function fetchCardsForDeck(
  deckId: string,
  options: { authToken?: string } = {}
): Promise<DeckCardRecord[]> {
  const details = await fetchDeckDetails(deckId, options);
  return details.cards ?? [];
}

export async function fetchPublicDeckStats(): Promise<PublicDeckStats> {
  const { data, error } = await supabase
    .from("decks")
    .select("id, is_free, cards(count)")
    .eq("is_public", true);

  if (error) {
    decksLogger.error("Failed to load public deck stats", {
      error: toErrorMetadata(error),
    });
    throw new Error("Unable to load public deck stats");
  }

  const decks = (data ?? []) as DeckWithCardAggregate[];

  const totalPublicDecks = decks.length;
  const totalCards = decks.reduce((sum, deck) => {
    const count = Array.isArray(deck.cards) ? deck.cards[0]?.count ?? 0 : 0;
    return sum + (count ?? 0);
  }, 0);

  const freeDeck = decks.find((deck) => deck.is_free === true);

  return {
    totalPublicDecks,
    totalCards,
    freeDeckId: freeDeck?.id ?? null,
  } satisfies PublicDeckStats;
}

export async function fetchDecksWithCardCounts(
  options: {
    authToken?: string;
  } = {}
): Promise<DeckWithCardCount[]> {
  const response = await callSupabaseFunction<{
    decks?: Array<{
      id: string;
      name: string;
      theme: string | null;
      description: string | null;
      cardCount: number;
    }>;
  }>("list-admin-decks", {
    authToken: options.authToken,
    body: {},
  });

  return (response.decks ?? []).map((deck) => ({
    id: deck.id,
    name: deck.name,
    theme: deck.theme ?? "",
    description: deck.description ?? null,
    cardCount: deck.cardCount ?? 0,
  }));
}

export async function fetchDeckDetails(
  deckId: string,
  options: { authToken?: string } = {}
): Promise<DeckDetailsResponse> {
  if (!deckId) {
    throw new Error("Deck ID is required");
  }

  const response = await callSupabaseFunction<DeckDetailsResponse>(
    "get-deck-details",
    {
      body: { deckId },
      authToken: options.authToken,
    }
  );

  return {
    deck: response.deck,
    cards: response.cards ?? [],
    cardCount: response.cardCount ?? response.cards?.length ?? 0,
    hasAccess: response.hasAccess ?? false,
  };
}
