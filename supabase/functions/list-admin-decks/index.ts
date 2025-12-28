// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";
import { ClerkAuthError, requireClerkUserId } from "../_shared/clerk-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function createServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey =
    Deno.env.get("CUSTOM_SUPABASE_SERVICE_KEY") ||
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase credentials are not configured");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

async function ensureAdminAccess(supabase, userId: string) {
  const { data: roleRow, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError) {
    console.error("Failed to verify admin role:", roleError.message);
    throw roleError;
  }

  if (!roleRow) {
    return false;
  }

  return true;
}

function sanitizeDeck(deck: any) {
  return {
    id: deck.id,
    name: deck.name,
    description: deck.description,
    theme: deck.theme,
    category: deck.category,
    featured: deck.featured ?? false,
    isPublic: deck.is_public ?? false,
    isFree: deck.is_free ?? false,
    plays: deck.plays ?? 0,
    rating: deck.rating,
    totalRatings: deck.total_ratings,
    cardCount: Array.isArray(deck.cards) ? deck.cards[0]?.count ?? 0 : 0,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    const headers = new Headers(corsHeaders);
    const requestedHeaders = req.headers.get("Access-Control-Request-Headers");
    if (requestedHeaders) {
      headers.set("Access-Control-Allow-Headers", requestedHeaders);
    }
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const clerkUserId = await requireClerkUserId(req);
    const supabase = createServiceClient();

    const isAdmin = await ensureAdminAccess(supabase, clerkUserId);

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("decks")
      .select(
        "id, name, theme, description, category, featured, is_public, is_free, plays, rating, total_ratings, cards(count)"
      )
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    const decks = (data ?? []).map(sanitizeDeck);

    return new Response(JSON.stringify({ decks }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof ClerkAuthError ? 401 : 400;

    console.error("Error listing admin decks:", error);

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
