import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface DashboardStats {
  totalUsers: number;
  totalDecks: number;
  totalPlays: number;
  totalRevenue: number;
  averageRating: number;
  totalGames: number;
}

export interface TopDeckSummary {
  id: string;
  name: string;
  plays: number;
  rating: number | null;
  total_ratings: number | null;
}

export interface AdminDashboardData {
  stats: DashboardStats;
  topDecks: TopDeckSummary[];
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  const [
    profilesResponse,
    decksCountResponse,
    deckStatsResponse,
    purchasesResponse,
    gamesResponse,
    topDecksResponse,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("decks").select("*", { count: "exact", head: true }),
    supabase.from("decks").select("plays, rating"),
    supabase.from("purchases").select("amount"),
    supabase.from("games").select("*", { count: "exact", head: true }),
    supabase
      .from("decks")
      .select("id, name, plays, rating, total_ratings")
      .order("plays", { ascending: false })
      .limit(10),
  ]);

  if (profilesResponse.error) {
    throw new Error(profilesResponse.error.message);
  }

  if (decksCountResponse.error) {
    throw new Error(decksCountResponse.error.message);
  }

  if (deckStatsResponse.error) {
    throw new Error(deckStatsResponse.error.message);
  }

  if (purchasesResponse.error) {
    throw new Error(purchasesResponse.error.message);
  }

  if (gamesResponse.error) {
    throw new Error(gamesResponse.error.message);
  }

  if (topDecksResponse.error) {
    throw new Error(topDecksResponse.error.message);
  }

  const deckStats = deckStatsResponse.data ?? [];
  const totalPlays = deckStats.reduce(
    (sum, deck) => sum + (deck.plays ?? 0),
    0
  );

  const ratedDecks = deckStats.filter(
    (deck) => typeof deck.rating === "number"
  );
  const averageRating = ratedDecks.length
    ? ratedDecks.reduce((sum, deck) => sum + (deck.rating ?? 0), 0) /
      ratedDecks.length
    : 0;

  type PurchaseRow = Database["public"]["Tables"]["purchases"]["Row"];
  const totalRevenue =
    (purchasesResponse.data as PurchaseRow[] | null | undefined)?.reduce(
      (sum, purchase) => sum + Number(purchase.amount ?? 0),
      0
    ) ?? 0;

  return {
    stats: {
      totalUsers: profilesResponse.count ?? 0,
      totalDecks: decksCountResponse.count ?? 0,
      totalPlays,
      totalRevenue,
      averageRating,
      totalGames: gamesResponse.count ?? 0,
    },
    topDecks: topDecksResponse.data ?? [],
  };
}

export async function userHasRole(
  userId: string,
  role: Database["public"]["Enums"]["app_role"]
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return !!data;
}
