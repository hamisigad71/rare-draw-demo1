import { Button } from "@/components/ui/button";
import { Sparkles, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import logo from "@/assets/raredraw.png";
import { fetchPublicDeckStats } from "@/repositories/decksRepository";
import { logger, updateLoggerContext, toErrorMetadata } from "@/lib/logger";

export const Hero = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [freeDeckId, setFreeDeckId] = useState<string | null>(null);
  const heroLogger = useMemo(
    () => logger.withContext({ component: "hero" }),
    []
  );

  useEffect(() => {
    updateLoggerContext({ component: "hero" });
    const fetchStats = async () => {
      heroLogger.info("Fetching hero deck stats");
      try {
        const stats = await fetchPublicDeckStats();
        setFreeDeckId(stats.freeDeckId);
        heroLogger.info("Loaded hero stats", {
          hasFreeDeck: Boolean(stats.freeDeckId),
        });
      } catch (error) {
        heroLogger.error("Failed to load hero stats", {
          error: toErrorMetadata(error),
        });
      }
    };

    fetchStats();
  }, [heroLogger]);

  const handlePlayClick = () => {
    if (!isSignedIn) {
      navigate("/auth");
    } else {
      navigate(freeDeckId ? `/game?deck=${freeDeckId}` : "/marketplace");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img
              src={logo}
              alt="RareDraw Logo - Premium themed card decks for meaningful connections"
              className="h-32 w-auto rounded-3xl drop-shadow-[0_0_25px_rgba(250,182,52,0.4)] hover:drop-shadow-[0_0_40px_rgba(250,182,52,0.6)] transition-all duration-300"
            />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            RareDraw
          </h1>

          <p className="text-xl md:text-2xl text-foreground/90 mb-4 font-light">
            Turn any Night Into Game Night
          </p>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Whether you're sipping, snacking, or just hanging out, explore card
            decks made to spark laughter in any group.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary via-primary/90 to-primary hover:from-primary/90 hover:via-primary hover:to-primary/90 text-primary-foreground font-bold px-10 py-7 text-lg transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-2xl"
              onClick={handlePlayClick}
            >
              <Play className="mr-2 h-6 w-6" />
              <span>Play Now</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary/50 text-foreground hover:text-foreground hover:bg-primary/10 hover:border-primary px-10 py-7 text-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-background/50 relative overflow-hidden group"
              onClick={() => navigate("/marketplace")}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <Sparkles className="mr-2 h-6 w-6 relative z-10 group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">Browse Decks</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                21+
              </div>
              <div className="text-sm text-muted-foreground">Themed Decks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                1000+
              </div>
              <div className="text-sm text-muted-foreground">Unique Cards</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                ∞
              </div>
              <div className="text-sm text-muted-foreground">Possibilities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
