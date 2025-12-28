import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Trophy,
  Lock,
  ArrowRight,
  Flame,
  Target,
  ThumbsUp,
  RotateCcw,
} from "lucide-react";
import deep from "@/assets/deck-deep.jpg";
import adventure from "@/assets/deck-adventure.jpg";
import romance from "@/assets/deck-romance.jpg";
import { useAuth } from "@/hooks/useAuth";

const GameEnd = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const score = parseInt(searchParams.get("score") || "0");
  const passed = parseInt(searchParams.get("passed") || "0");
  const deckName = searchParams.get("deckName") || "your deck";
  const total = score + passed;
  const completionRate = total > 0 ? Math.round((score / total) * 100) : 0;
  const getPerformanceMessage = () => {
    if (completionRate >= 80)
      return { emoji: "🔥", text: "Legendary!", color: "text-orange-500" };
    if (completionRate >= 60)
      return { emoji: "⭐", text: "Great Job!", color: "text-yellow-500" };
    if (completionRate >= 40)
      return { emoji: "👍", text: "Nice Try!", color: "text-blue-500" };
    return { emoji: "💪", text: "Keep Going!", color: "text-purple-500" };
  };

  const performance = getPerformanceMessage();

  const premiumDecks = [
    {
      name: "Deep Conversations",
      description: "75 thought-provoking questions",
      price: "Ksh 500",
      image: deep,
    },
    {
      name: "Adventure & Travel",
      description: "60 cards for wanderlust souls",
      price: "Ksh 400",
      image: adventure,
    },
    {
      name: "Romance & Relationships",
      description: "100 intimate connection cards",
      price: "Ksh 650",
      image: romance,
    },
  ];

  // Authenticated user view - Fun stats page
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-6">
          {/* Main Stats Card */}
          <Card className="text-center animate-scale-in border-primary/20 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-primary/70 to-primary" />

            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4 animate-bounce">
                <Trophy className="w-20 h-20 text-primary drop-shadow-lg" />
              </div>
              <CardTitle className="text-4xl md:text-5xl mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                {performance.emoji} {performance.text}
              </CardTitle>
              <CardDescription className="text-xl">
                You completed{" "}
                <span className="font-bold text-foreground">{deckName}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-8">
              {/* Main Stats Grid */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20 transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <ThumbsUp className="w-6 h-6 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                      {score}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Cards Completed
                  </div>
                </div>

                <div className="p-6 bg-muted/50 rounded-xl border transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <RotateCcw className="w-6 h-6 text-muted-foreground" />
                    <div className="text-4xl font-bold">{passed}</div>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Cards Passed
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20 transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Target className="w-6 h-6 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                      {completionRate}%
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Success Rate
                  </div>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="bg-muted/30 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center justify-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Your Achievements
                </h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {completionRate >= 80 && (
                    <Badge variant="default" className="text-sm py-2 px-4">
                      🔥 Perfect Run
                    </Badge>
                  )}
                  {score > 10 && (
                    <Badge variant="secondary" className="text-sm py-2 px-4">
                      ⚡ Speed Player
                    </Badge>
                  )}
                  {total === score + passed && (
                    <Badge variant="outline" className="text-sm py-2 px-4">
                      ✨ Deck Master
                    </Badge>
                  )}
                  {passed === 0 && (
                    <Badge
                      variant="default"
                      className="text-sm py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500"
                    >
                      🏆 No Skip Champion
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-14"
                  onClick={() => navigate("/game")}
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Play Again
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-14 bg-primary hover:bg-primary/90"
                  onClick={() => navigate("/marketplace")}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Browse More Decks
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fun Facts Card */}
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-2xl font-bold text-primary">{total}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Cards Played
                  </div>
                </div>
                <div>
                  <div className="text-3xl mb-2">⏱️</div>
                  <div className="text-2xl font-bold">
                    ~{Math.ceil(total * 1.5)} min
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Estimated Time
                  </div>
                </div>
                <div>
                  <div className="text-3xl mb-2">🎊</div>
                  <div className="text-2xl font-bold">Epic!</div>
                  <div className="text-sm text-muted-foreground">
                    Overall Vibe
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Non-authenticated user view - Conversion screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Game Stats Card */}
        <Card className="text-center animate-scale-in border-primary/20 shadow-lg">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-3xl md:text-4xl mb-2">
              Game Complete! 🎉
            </CardTitle>
            <CardDescription className="text-lg">
              You finished the Classic Icebreakers deck
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">{score}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-3xl font-bold">{passed}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">
                  {completionRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Success Rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unlock Premium CTA */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 animate-fade-in shadow-xl">
          <CardHeader className="text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
            <CardTitle className="text-2xl md:text-3xl">
              Want to Unlock More Decks?
            </CardTitle>
            <CardDescription className="text-base md:text-lg">
              Create a free account to access 24 premium themed decks and track
              your progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Premium Decks Preview */}
            <div className="grid md:grid-cols-3 gap-4">
              {premiumDecks.map((deck, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img
                    src={deck.image}
                    alt={deck.name}
                    className="w-full h-40 object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-bold text-white text-sm">
                        {deck.name}
                      </h4>
                      <Lock className="w-4 h-4 text-white flex-shrink-0" />
                    </div>
                    <p className="text-xs text-white/80 mb-2">
                      {deck.description}
                    </p>
                    <Badge variant="secondary" className="text-xs self-start">
                      {deck.price}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="bg-muted/30 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-lg mb-4">
                With a RareDraw account you get:
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "🎯 Access to 24+ premium decks",
                  "🎨 AI-powered custom deck creation",
                  "📊 Track your game stats & badges",
                  "👥 Multiplayer game sessions",
                  "💾 Save your favorite decks",
                  "🔄 Sync across all devices",
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center text-sm">
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 h-14 text-lg bg-primary hover:bg-primary/90 group"
                onClick={() => navigate("/auth")}
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 h-14 text-lg"
                onClick={() => navigate("/")}
              >
                Back to Home
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/auth")}
                className="text-primary hover:underline font-medium"
              >
                Sign in here
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameEnd;
