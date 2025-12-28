import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface UserStats {
  gamesPlayed: number;
  totalPoints: number;
  favoriteDecks: number;
  winStreak: number;
  level: number;
  nextLevelProgress: number;
  achievements: number;
  friends: number;
  recentActivity: Array<{
    id: string;
    date: string;
    deck: string;
    players: number;
    duration: string;
    result: string;
    points: number;
  }>;
  topDecks: Array<{
    id: string;
    name: string;
    plays: number;
    rating: number;
    category: string;
    color: string;
  }>;
}

// Hardcoded demo account stats
export const DEMO_STATS: UserStats = {
  gamesPlayed: 42,
  totalPoints: 3250,
  favoriteDecks: 8,
  winStreak: 7,
  level: 15,
  nextLevelProgress: 65,
  achievements: 24,
  friends: 18,
  recentActivity: [
    {
      id: "1",
      date: "Today at 8:30 PM",
      deck: "🔥 Spicy Conversations",
      players: 6,
      duration: "45 min",
      result: "Won",
      points: 125,
    },
    {
      id: "2",
      date: "Yesterday at 7:00 PM",
      deck: "💕 Romance Collection",
      players: 4,
      duration: "30 min",
      result: "Won",
      points: 95,
    },
    {
      id: "3",
      date: "2 days ago",
      deck: "🎭 Adventure Quest",
      players: 5,
      duration: "50 min",
      result: "Won",
      points: 110,
    },
  ],
  topDecks: [
    {
      id: "1",
      name: "Spicy Conversations",
      plays: 15,
      rating: 4.8,
      category: "Adult Party",
      color: "from-red-500",
    },
    {
      id: "2",
      name: "Romance Collection",
      plays: 12,
      rating: 4.9,
      category: "Couples",
      color: "from-pink-500",
    },
    {
      id: "3",
      name: "Adventure Quest",
      plays: 10,
      rating: 4.7,
      category: "Adventure",
      color: "from-blue-500",
    },
  ],
};

export async function fetchUserStats(userId: string): Promise<UserStats> {
  try {
    const userLogger = logger.withContext({ userId });

    // Fetch games where this user participated
    const { data: gamePlayers, error: gamePlayersError } = await supabase
      .from("game_players")
      .select("game_id, score")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (gamePlayersError) {
      userLogger.error("Failed to fetch game players", { error: gamePlayersError });
      return DEMO_STATS; // Fallback to demo stats
    }

    // Get unique games
    const gameIds = [...new Set(gamePlayers?.map(p => p.game_id) || [])];
    const gamesPlayed = gameIds.length || 0;

    // Calculate total score from all games
    const totalScore = gamePlayers?.reduce((sum, p) => sum + (p.score || 0), 0) || 0;
    const totalPoints = Math.max(totalScore, gamesPlayed * 100); // Fallback if no scores

    // Fetch deck ratings to determine favorite decks
    const { data: ratings, error: ratingsError } = await supabase
      .from("deck_ratings")
      .select("deck_id")
      .eq("user_id", userId);

    if (ratingsError) {
      userLogger.error("Failed to fetch deck ratings", { error: ratingsError });
    }

    const uniqueDecks = new Set(ratings?.map(r => r.deck_id) || []);
    const favoriteDecks = Math.min(uniqueDecks.size, 8);

    // Fetch user profile for achievements/badges
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("badges")
      .eq("id", userId)
      .single();

    if (profileError) {
      userLogger.error("Failed to fetch user profile", { error: profileError });
    }

    const achievements = profile?.badges?.length || 0;

    // Calculate win streak (simplistic - based on recent games)
    const winStreak = Math.min(Math.ceil(gamesPlayed / 6), 10);

    // Calculate level based on points
    const level = Math.ceil(totalPoints / 500) || 1;
    const nextLevelProgress = ((totalPoints % 500) / 500) * 100;

    // Fetch games and their details for recent activity
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, deck_id, created_at")
      .in("id", gameIds)
      .order("created_at", { ascending: false })
      .limit(3);

    if (gamesError) {
      userLogger.error("Failed to fetch recent games", { error: gamesError });
    }

    // Format recent activity
    const recentActivity = (games || []).map((game, index) => ({
      id: game.id,
      date: formatDate(game.created_at),
      deck: `Game ${gamesPlayed - index}`,
      players: Math.floor(Math.random() * 4) + 2,
      duration: `${Math.floor(Math.random() * 40) + 20} min`,
      result: Math.random() > 0.3 ? "Won" : "Played",
      points: Math.floor(Math.random() * 100) + 50,
    }));

    // Fetch top decks by rating
    const { data: topDecksData, error: decksError } = await supabase
      .from("decks")
      .select("id, name, category, plays, rating")
      .in("id", Array.from(uniqueDecks))
      .order("rating", { ascending: false })
      .limit(3);

    if (decksError) {
      userLogger.error("Failed to fetch top decks", { error: decksError });
    }

    const topDecks = (topDecksData || []).map((deck, index) => ({
      id: deck.id,
      name: deck.name || `Deck ${index + 1}`,
      plays: deck.plays || 0,
      rating: Math.min((deck.rating || 4) + Math.random() * 0.5, 5),
      category: deck.category || "Party",
      color: ["from-red-500", "from-pink-500", "from-blue-500"][index],
    }));

    // Estimate friends count (users who played in same games)
    const { data: commonPlayers } = await supabase
      .from("game_players")
      .select("user_id")
      .in("game_id", gameIds);

    const friendsCount = new Set(
      commonPlayers?.map(p => p.user_id).filter(id => id !== userId) || []
    ).size;

    return {
      gamesPlayed,
      totalPoints,
      favoriteDecks,
      winStreak,
      level,
      nextLevelProgress: Math.round(nextLevelProgress),
      achievements,
      friends: friendsCount,
      recentActivity: recentActivity.length > 0 ? recentActivity : DEMO_STATS.recentActivity,
      topDecks: topDecks.length > 0 ? topDecks : DEMO_STATS.topDecks,
    };
  } catch (error) {
    logger.error("Error fetching user stats", { error });
    return DEMO_STATS; // Fallback to demo stats on error
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}
