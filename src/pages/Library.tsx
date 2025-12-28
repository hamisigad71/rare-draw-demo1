import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Play, Users, ArrowLeft, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchOwnedDecks,
  OwnedDeckSummary,
} from "@/repositories/libraryRepository";
import { LibraryDeckCard } from "@/components/LibraryDeckCard";

type OwnedDeck = OwnedDeckSummary;

const Library = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [ownedDecks, setOwnedDecks] = useState<OwnedDeck[]>([]);
  const { isLoaded, isSignedIn } = useAuth();

  const loadOwnedDecks = useCallback(async () => {
    try {
      setLoading(true);
      const decks = await fetchOwnedDecks();
      setOwnedDecks(decks);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected error while loading your library";
      toast({
        title: "Error loading library",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to view your library",
        variant: "destructive",
      });
      setLoading(false);
      navigate("/auth");
      return;
    }

    loadOwnedDecks();
  }, [isLoaded, isSignedIn, loadOwnedDecks, navigate, toast]);

  const formatPlays = (plays: number | null | undefined) => {
    if (!plays) return "0";
    if (plays >= 1000) {
      return `${(plays / 1000).toFixed(1)}k`;
    }
    return plays.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 px-4">
          <div className="max-w-7xl mx-auto py-12">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="break-inside-avoid mb-6">
                  <Skeleton className="w-full h-96 rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-36 pb-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            My Library
          </h1>
          <p className="text-xl text-muted-foreground">
            {ownedDecks.length} {ownedDecks.length === 1 ? "deck" : "decks"}{" "}
            ready to play
          </p>
        </div>
      </section>

      <section className="py-12 px-4 pb-24">
        <div className="container max-w-7xl mx-auto">
          {ownedDecks.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Decks Yet</h2>
              <p className="text-muted-foreground mb-6">
                Browse the marketplace to find decks you'll love
              </p>
              <Button onClick={() => navigate("/marketplace")} size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                Browse Marketplace
              </Button>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {ownedDecks.map((deck) => (
                <LibraryDeckCard key={deck.id} deck={deck} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Library;
