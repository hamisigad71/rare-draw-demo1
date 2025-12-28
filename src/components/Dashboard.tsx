import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Play, BarChart3, Star, Fire, TrendingUp, Clock, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock stats - in real app these would come from backend
  const stats = {
    gamesPlayed: 24,
    totalPoints: 1250,
    favoriteDecks: 5,
    winStreak: 3,
    recentActivity: [
      { date: "Today", deck: "Romance Collection", players: 4 },
      { date: "Yesterday", deck: "Party Vibes", players: 6 },
      { date: "2 days ago", deck: "Adventure Quest", players: 3 },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Welcome Section */}
        <div className="mb-12 animate-fade-in">
          <div className="premium-card border-2 border-primary/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-5" />
            <div className="relative z-10 md:flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                  Welcome back, {user?.firstName || "Player"}! 🎮
                </h1>
                <p className="text-lg text-foreground/70 mb-6 max-w-2xl">
                  You've been on an amazing gaming journey. Let's continue the fun and create more unforgettable moments with your friends.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => navigate("/game")}
                    className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-8 py-6 text-lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Play Now
                  </Button>
                  <Button
                    onClick={() => navigate("/marketplace")}
                    variant="outline"
                    className="border-2 border-primary/30 hover:bg-primary/5 font-semibold rounded-lg px-8 py-6 text-lg transition-all duration-300"
                  >
                    Explore Decks
                  </Button>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center mt-8 md:mt-0">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-10 blur-2xl animate-pulse" />
                  <div className="absolute inset-8 bg-gradient-secondary rounded-full opacity-5 blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy className="w-24 h-24 text-primary opacity-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="premium-card group cursor-pointer hover:scale-105 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Games Played</p>
                <p className="text-4xl font-bold gradient-text">{stats.gamesPlayed}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Gamepad2Icon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">📈 +3 this week</p>
          </div>

          <div className="premium-card group cursor-pointer hover:scale-105 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Total Points</p>
                <p className="text-4xl font-bold gradient-text">{stats.totalPoints}</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                <Star className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">🌟 Level 12</p>
          </div>

          <div className="premium-card group cursor-pointer hover:scale-105 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Win Streak</p>
                <p className="text-4xl font-bold text-orange-500">{stats.winStreak}</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                <Fire className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">🔥 Keep it going!</p>
          </div>

          <div className="premium-card group cursor-pointer hover:scale-105 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Favorite Decks</p>
                <p className="text-4xl font-bold text-purple-500">{stats.favoriteDecks}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <Award className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">💎 Premium Collection</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Recent Games
            </h2>
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="premium-card border-l-4 border-l-primary hover:shadow-elevated transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {activity.deck}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{activity.date}</span>
                        <span className="text-sm text-primary font-medium">
                          👥 {activity.players} players
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => navigate("/game")}
                    >
                      Play Again
                      <Play className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-secondary" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/marketplace")}
                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold py-6 rounded-lg transition-all duration-300 justify-start text-base"
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Browse New Decks
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 border-secondary/30 hover:bg-secondary/5 font-semibold py-6 rounded-lg transition-all duration-300 justify-start text-base"
              >
                <Star className="w-5 h-5 mr-3 text-secondary" />
                View Achievements
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 border-primary/30 hover:bg-primary/5 font-semibold py-6 rounded-lg transition-all duration-300 justify-start text-base"
              >
                <Fire className="w-5 h-5 mr-3 text-orange-500" />
                Daily Challenge
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 border-border/30 hover:bg-secondary/5 font-semibold py-6 rounded-lg transition-all duration-300 justify-start text-base"
              >
                <Award className="w-5 h-5 mr-3 text-purple-500" />
                Invite Friends
              </Button>
            </div>

            {/* Membership Card */}
            <div className="mt-8 premium-card border-2 border-gradient-primary bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Premium Member</h3>
                  <Star className="w-5 h-5 text-primary fill-primary" />
                </div>
                <p className="text-sm text-foreground/70 mb-4">
                  Unlock exclusive decks and features with your premium membership.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-primary/50 text-primary hover:bg-primary/10 font-semibold"
                >
                  View Benefits
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icon component for gamepad
function Gamepad2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="6" y1="12" x2="12" y2="12" />
      <line x1="9" y1="9" x2="9" y2="15" />
      <circle cx="17" cy="12" r="1" />
      <circle cx="20" cy="9" r="1" />
    </svg>
  );
}
