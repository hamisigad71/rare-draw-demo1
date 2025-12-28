// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";
import { ClerkAuthError, requireClerkSession } from "../_shared/clerk-auth.ts";
import { createRequestLogger, ServerLogger } from "../_shared/logger.ts";

type DeckRow = {
  id: string;
  name: string;
  theme: string;
  price: number | null;
  is_free: boolean | null;
  is_public: boolean | null;
  creator_id: string | null;
  category: string | null;
  featured: boolean | null;
  plays: number | null;
  rating: number | null;
  total_ratings: number | null;
  description: string | null;
  thumbnail_url: string | null;
};

type CardRow = {
  id: string;
  deck_id: string;
  description: string | null;
  action_type: string;
  order_index: number | null;
  suggester_nickname: string | null;
};

type DeckDetailsResponse = {
  deck: DeckRow & {
    price: number;
    is_free: boolean;
    is_public: boolean;
    featured: boolean;
    plays: number;
  };
  cards: CardRow[];
  cardCount: number;
  hasAccess: boolean;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function buildSupabaseClient(log: ServerLogger) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error("Supabase credentials are missing", {
      hasUrl: Boolean(supabaseUrl),
      hasServiceKey: Boolean(supabaseServiceKey),
    });
    throw new Error("Supabase credentials are not configured");
  }

  log.debug("Creating Supabase client for get-deck-details");
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

async function getOptionalClerkUserId(
  req: Request,
  log: ServerLogger
): Promise<string | null> {
  const authorizationHeader = req.headers.get("Authorization");

  if (!authorizationHeader) {
    return null;
  }

  try {
    const token = extractBearerToken(authorizationHeader);

    if (!token || !isLikelyClerkToken(token)) {
      return null;
    }

    const { claims } = await requireClerkSession(req);
    const tokenClaims = claims as {
      user_id?: string;
      userId?: string;
      sub?: string;
    };

    return tokenClaims.user_id ?? tokenClaims.userId ?? tokenClaims.sub ?? null;
  } catch (error) {
    if (error instanceof ClerkAuthError) {
      log.warn("Clerk auth failed; falling back to anonymous access", {
        error: error.message,
      });
      return null;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    log.error("Unexpected error during Clerk auth", { error: message });
    throw new ClerkAuthError(message);
  }
}

function sanitizeDeck(deck: DeckRow): DeckDetailsResponse["deck"] {
  return {
    id: deck.id,
    name: deck.name,
    theme: deck.theme,
    price: Number(deck.price ?? 0),
    is_free: deck.is_free ?? false,
    is_public: deck.is_public ?? true,
    creator_id: deck.creator_id,
    category: deck.category,
    featured: deck.featured ?? false,
    plays: deck.plays ?? 0,
    rating: deck.rating,
    total_ratings: deck.total_ratings,
    description: deck.description,
    thumbnail_url: deck.thumbnail_url,
  };
}

function extractBearerToken(headerValue: string): string | null {
  const matches = headerValue.match(/^Bearer\s+(.+)$/i);

  if (!matches || matches.length < 2) {
    return null;
  }

  const token = matches[1]?.trim();
  return token && token.length > 0 ? token : null;
}

function isLikelyClerkToken(token: string): boolean {
  const segments = token.split(".");

  if (segments.length !== 3 || segments.some((segment) => !segment.trim())) {
    return false;
  }

  try {
    const headerJson = decodeBase64Url(segments[0]);
    const header = JSON.parse(headerJson) as Record<string, unknown>;

    const kid = typeof header?.kid === "string" ? header.kid.trim() : "";

    return kid.length > 0;
  } catch (_error) {
    return false;
  }
}

function decodeBase64Url(value: string): string {
  const padded = value.padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    "="
  );
  const normalized = padded.replace(/-/g, "+").replace(/_/g, "/");
  return atob(normalized);
}

function sanitizeCards(cards: CardRow[]): CardRow[] {
  return cards.map((card) => ({
    id: card.id,
    deck_id: card.deck_id,
    description: card.description,
    action_type: card.action_type,
    order_index: card.order_index,
    suggester_nickname: card.suggester_nickname,
  }));
}

Deno.serve(async (req) => {
  const requestId =
    typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const log = createRequestLogger({
    function: "get-deck-details",
    requestId,
  });

  log.info("Incoming request", {
    method: req.method,
    url: req.url,
  });

  if (req.method === "OPTIONS") {
    const headers = new Headers(corsHeaders);
    const requestedHeaders = req.headers.get("Access-Control-Request-Headers");
    if (requestedHeaders) {
      headers.set("Access-Control-Allow-Headers", requestedHeaders);
    }
    log.debug("Handled OPTIONS preflight", { requestId });
    return new Response(null, { headers, status: 204 });
  }

  if (req.method !== "POST") {
    log.warn("Method not allowed", { method: req.method });
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { deckId } = (await req.json()) as { deckId?: string };

    if (!deckId || typeof deckId !== "string" || deckId.trim().length === 0) {
      log.warn("Missing deckId in request body");
      return new Response(JSON.stringify({ error: "deckId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log.info("Fetching deck details", { deckId });

    const supabase = buildSupabaseClient(log);

    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select(
        "id, name, theme, price, is_free, is_public, creator_id, category, featured, plays, rating, total_ratings, description, thumbnail_url"
      )
      .eq("id", deckId)
      .maybeSingle();

    if (deckError) {
      log.error("Error fetching deck row", { deckId, error: deckError });
      throw deckError;
    }

    if (!deck) {
      log.warn("Deck not found", { deckId });
      return new Response(JSON.stringify({ error: "Deck not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userId: string | null = null;
    try {
      userId = await getOptionalClerkUserId(req, log);
    } catch (authError) {
      if (authError instanceof ClerkAuthError) {
        log.warn("Clerk authentication error while fetching deck", {
          deckId,
          error: authError.message,
        });
        return new Response(JSON.stringify({ error: authError.message }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      log.error("Unexpected Clerk auth error", {
        deckId,
        error: authError,
      });

      throw authError;
    }

    const sanitizedDeck = sanitizeDeck(deck);

    let hasAccess = sanitizedDeck.is_free;

    if (!hasAccess && userId) {
      if (sanitizedDeck.creator_id === userId) {
        hasAccess = true;
      } else {
        const { data: purchase, error: purchaseError } = await supabase
          .from("purchases")
          .select("id")
          .eq("deck_id", deckId)
          .eq("user_id", userId)
          .maybeSingle();

        if (purchaseError) {
          log.error("Error checking purchase access", {
            deckId,
            userId,
            error: purchaseError,
          });
          throw purchaseError;
        }

        hasAccess = !!purchase;
      }
    }

    const { count: cardCount, error: cardCountError } = await supabase
      .from("cards")
      .select("id", { count: "exact", head: true })
      .eq("deck_id", deckId);

    if (cardCountError) {
      log.error("Error counting deck cards", {
        deckId,
        error: cardCountError,
      });
      throw cardCountError;
    }

    let cards: CardRow[] = [];

    if (hasAccess) {
      const { data: cardRows, error: cardsError } = await supabase
        .from("cards")
        .select(
          "id, deck_id, description, action_type, order_index, suggester_nickname"
        )
        .eq("deck_id", deckId)
        .order("order_index", { ascending: true });

      if (cardsError) {
        log.error("Error retrieving deck cards", {
          deckId,
          error: cardsError,
        });
        throw cardsError;
      }

      cards = sanitizeCards(cardRows ?? []);
    }

    const response: DeckDetailsResponse = {
      deck: sanitizedDeck,
      cards,
      cardCount: cardCount ?? cards.length,
      hasAccess,
    };

    log.info("Deck details fetched", {
      deckId,
      hasAccess,
      cardCount: response.cardCount,
      cardsReturned: cards.length,
      userId,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    log.error("Error fetching deck details", {
      error,
    });

    const status = error instanceof ClerkAuthError ? 401 : 400;
    const message = error instanceof Error ? error.message : "Unknown error";

    log.warn("Returning error response", {
      status,
      message,
    });

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
