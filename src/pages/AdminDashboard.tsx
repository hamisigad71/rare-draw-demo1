import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Users,
  Package,
  PlayCircle,
  DollarSign,
  TrendingUp,
  Star,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateCardsForAllDecks } from "@/lib/generateDeckCards";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAdminDashboardData } from "@/repositories/adminRepository";
import { logger, toErrorMetadata } from "@/lib/logger";

interface DashboardStats {
  totalUsers: number;
  totalDecks: number;
  totalPlays: number;
  totalRevenue: number;
  averageRating: number;
  totalGames: number;
}

interface TopDeck {
  id: string;
  name: string;
  plays: number;
  rating: number;
  total_ratings: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { getAuthToken, isSignedIn, isLoaded } = useAuth();
  const { toast } = useToast();
  const dashboardLogger = useMemo(
    () => logger.withContext({ screen: "admin-dashboard" }),
    []
  );
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDecks: 0,
    totalPlays: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalGames: 0,
  });
  const [topDecks, setTopDecks] = useState<TopDeck[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      dashboardLogger.warn("Redirecting non-admin user from dashboard");
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [adminLoading, dashboardLogger, isAdmin, navigate, toast]);

  const loadStats = useCallback(async () => {
    dashboardLogger.info("Fetching admin dashboard statistics");
    try {
      setIsLoadingStats(true);

      const { stats: dashboardStats, topDecks: topDeckSummaries } =
        await fetchAdminDashboardData();

      setStats(dashboardStats);
      setTopDecks(topDeckSummaries);
      dashboardLogger.info("Admin stats loaded", {
        totalUsers: dashboardStats.totalUsers,
        totalDecks: dashboardStats.totalDecks,
        totalPlays: dashboardStats.totalPlays,
        totalRevenue: dashboardStats.totalRevenue,
        topDecks: topDeckSummaries.length,
      });
    } catch (error) {
      dashboardLogger.error("Failed to load admin stats", {
        error: toErrorMetadata(error),
      });
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
      dashboardLogger.debug("Finished admin stats fetch");
    }
  }, [dashboardLogger, toast]);

  useEffect(() => {
    if (isAdmin) {
      void loadStats();
    }
  }, [isAdmin, loadStats]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResults([]);

    dashboardLogger.info("Starting bulk card generation");

    try {
      if (!isLoaded) {
        dashboardLogger.warn("Card generation attempted before auth ready");
        throw new Error(
          "Authentication status is not ready yet. Please try again."
        );
      }

      if (!isSignedIn) {
        dashboardLogger.warn("Card generation attempted by signed-out user");
        throw new Error("You must be signed in before generating cards.");
      }

      const token = await getAuthToken();

      if (!token) {
        dashboardLogger.warn("Missing auth token for card generation");
        throw new Error(
          "Unable to obtain a Clerk session token. Please re-authenticate and try again."
        );
      }

      toast({
        title: "Starting card generation",
        description: "This may take a few minutes...",
      });
      const generationResults = await generateCardsForAllDecks({
        authToken: token,
        getAuthToken,
      });
      setResults(generationResults);

      const successCount = generationResults.filter((r) => r.success).length;
      const failCount = generationResults.filter((r) => !r.success).length;

      dashboardLogger.info("Completed bulk card generation", {
        successCount,
        failCount,
      });

      toast({
        title: "Card generation complete",
        description: `Success: ${successCount} decks, Failed: ${failCount} decks`,
      });

      // Reload stats after generation
      await loadStats();
    } catch (error) {
      dashboardLogger.error("Failed during card generation", {
        error: toErrorMetadata(error),
      });

      let errorMessage = "Failed to generate cards";
      if (error instanceof Error) {
        errorMessage = error.message;

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
      dashboardLogger.debug("Card generation handler completed", {
        isGenerating: false,
      });
    }
  };

  if (adminLoading || isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage your platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDecks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPlays.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{stats.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGames}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Decks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Decks</CardTitle>
          <CardDescription>Most played decks on your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deck Name</TableHead>
                <TableHead className="text-right">Plays</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="text-right">Total Ratings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topDecks.map((deck) => (
                <TableRow key={deck.id}>
                  <TableCell className="font-medium">{deck.name}</TableCell>
                  <TableCell className="text-right">
                    {deck.plays?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    {deck.rating?.toFixed(1) || "0.0"}
                  </TableCell>
                  <TableCell className="text-right">
                    {deck.total_ratings || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Card Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Deck Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Card Generation</AlertTitle>
            <AlertDescription>
              This will generate 50 AI-powered cards for each deck that doesn't
              already have cards. The process uses Lovable AI and may take
              several minutes to complete.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Cards...
              </>
            ) : (
              "Generate Cards for All Decks"
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
