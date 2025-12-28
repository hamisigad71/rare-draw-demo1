import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Play,
  BarChart3,
  Star,
  TrendingUp,
  Clock,
  Award,
  Zap,
  Target,
  Users,
  Gift,
  Trophy,
  Flame,
  Crown,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDemo, setIsDemo] = useState(false);
  const [userName, setUserName] = useState("Player");

  useEffect(() => {
    const demoMode = localStorage.getItem("demo_mode");
    setIsDemo(!!demoMode);
    
    if (demoMode) {
      setUserName("Demo Player");
    } else if (user?.firstName) {
      setUserName(user.firstName);
    }
  }, [user]);

  // Enhanced mock stats with more detailed data
  const stats = {
    gamesPlayed: 42,
    totalPoints: 3250,
    favoriteDecks: 8,
    winStreak: 7,
    level: 15,
    nextLevelProgress: 65,
    achievements: 24,
    friends: 18,
  };

  const recentActivity = [
    {
      id: 1,
      date: "Today at 8:30 PM",
      deck: "🔥 Spicy Conversations",
      players: 6,
      duration: "45 min",
      result: "Won",
      points: 125,
    },
    {
      id: 2,
      date: "Yesterday at 7:00 PM",
      deck: "💕 Romance Collection",
      players: 4,
      duration: "30 min",
      result: "Won",
      points: 95,
    },
    {
      id: 3,
      date: "2 days ago",
      deck: "🎭 Adventure Quest",
      players: 5,
      duration: "50 min",
      result: "Won",
      points: 110,
    },
  ];

  const topDecks = [
    {
      id: 1,
      name: "Spicy Conversations",
      plays: 15,
      rating: 4.8,
      category: "Adult Party",
      color: "from-red-500",
    },
    {
      id: 2,
      name: "Romance Collection",
      plays: 12,
      rating: 4.9,
      category: "Couples",
      color: "from-pink-500",
    },
    {
      id: 3,
      name: "Adventure Quest",
      plays: 10,
      rating: 4.7,
      category: "Adventure",
      color: "from-blue-500",
    },
  ];

  const achievements = [
    { icon: "🏆", title: "Champion", desc: "Won 10 games" },
    { icon: "🔥", title: "Streak Master", desc: "5+ win streak" },
    { icon: "💎", title: "Premium Member", desc: "VIP status" },
    { icon: "👥", title: "Social Butterfly", desc: "Played with 50+ friends" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="premium-card border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-500/10 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">Demo Mode Activated</p>
                  <p className="text-sm text-foreground/70">Experience RareDraw with sample data</p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                size="sm"
                className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Hero Welcome Section */}
        <div className="mb-12 animate-fade-in">
          <div className="premium-card border-2 border-gradient-primary overflow-hidden relative">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-primary opacity-5 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 md:flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-5xl md:text-6xl font-bold gradient-text">Welcome back!</h1>
                  <span className="text-5xl">🎮</span>
                </div>
                <h2 className="text-2xl text-foreground/80 mb-4 font-semibold">
                  {userName}
                </h2>
                <p className="text-lg text-foreground/70 mb-8 max-w-2xl leading-relaxed">
                  You're on an incredible gaming journey. Your win streak is impressive! Let's continue the fun and create more unforgettable moments with your friends.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => navigate("/game")}
                    className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-8 py-6 text-base group"
                  >
                    <Play className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    Start Playing Now
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                  <Button
                    onClick={() => navigate("/marketplace")}
                    variant="outline"
                    className="border-2 border-primary/30 hover:bg-primary/5 font-semibold rounded-lg px-8 py-6 text-base transition-all duration-300"
                  >
                    Browse New Decks
                  </Button>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center mt-8 md:mt-0">
                <div className="relative w-56 h-56">
                  <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-10 blur-3xl animate-pulse" />
                  <div className="absolute inset-8 bg-gradient-secondary rounded-full opacity-5 blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy className="w-28 h-28 text-primary opacity-30 animate-bounce" style={{ animationDelay: "0.5s" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="premium-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-bold text-lg">Level {stats.level}</h3>
                  <p className="text-sm text-foreground/70">XP Progress</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold gradient-text">{stats.nextLevelProgress}%</p>
                <p className="text-xs text-foreground/70">to Level {stats.level + 1}</p>
              </div>
            </div>
            <div className="w-full bg-secondary/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.nextLevelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="premium-card group hover:shadow-elevated transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-2">Games Played</p>
                <p className="text-4xl font-bold gradient-text">{stats.gamesPlayed}</p>
                <p className="text-xs text-muted-foreground mt-2">📈 +5 this week</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-all">
                <Play className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="premium-card group hover:shadow-elevated transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-2">Total Points</p>
                <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{stats.totalPoints}</p>
                <p className="text-xs text-muted-foreground mt-2">⭐ Premium Collection</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-all">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
          </div>

          <div className="premium-card group hover:shadow-elevated transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-2">Win Streak</p>
                <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{stats.winStreak}</p>
                <p className="text-xs text-muted-foreground mt-2">🔥 Keep it going!</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-all">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
              </div>
            </div>
          </div>

          <div className="premium-card group hover:shadow-elevated transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-2">Favorite Decks</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats.favoriteDecks}</p>
                <p className="text-xs text-muted-foreground mt-2">💎 Collection</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-all">
                <Award className="w-6 h-6 text-purple-500 fill-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Recent Games */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Recent Games</h2>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  className="premium-card border-l-4 border-l-primary hover:shadow-elevated transition-all duration-300 cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-lg group-hover:text-primary transition-colors">
                          {activity.deck}
                        </p>
                        <span className="px-3 py-1 bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                          {activity.result}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{activity.date}</span>
                        <span>👥 {activity.players} players</span>
                        <span>⏱️ {activity.duration}</span>
                        <span className="text-primary font-semibold">+{activity.points} XP</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10 group-hover:translate-x-1 transition-all"
                      onClick={() => navigate("/game")}
                    >
                      Replay
                      <Play className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {/* Quick Actions */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-secondary" />
                <h2 className="text-2xl font-bold">Quick Actions</h2>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/marketplace")}
                  className="w-full bg-gradient-primary hover:opacity-90 text-white font-bold py-5 rounded-lg transition-all duration-300 justify-start text-base group"
                >
                  <BarChart3 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Browse New Decks
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 border-secondary/30 hover:bg-secondary/5 font-semibold py-5 rounded-lg transition-all duration-300 justify-start text-base"
                >
                  <Target className="w-5 h-5 mr-3 text-secondary" />
                  View Achievements
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 border-orange-500/30 hover:bg-orange-500/5 font-semibold py-5 rounded-lg transition-all duration-300 justify-start text-base"
                >
                  <Zap className="w-5 h-5 mr-3 text-orange-500" />
                  Daily Challenge
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 border-border/30 hover:bg-secondary/5 font-semibold py-5 rounded-lg transition-all duration-300 justify-start text-base"
                >
                  <Users className="w-5 h-5 mr-3 text-primary" />
                  Invite Friends
                </Button>
              </div>
            </div>

            {/* Top Decks */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-lg">Your Top Decks</h3>
              </div>
              <div className="space-y-3">
                {topDecks.map((deck) => (
                  <div
                    key={deck.id}
                    className="premium-card border-l-4 border-l-primary hover:shadow-elevated transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold mb-1 group-hover:text-primary transition-colors">{deck.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{deck.category}</span>
                          <span>•</span>
                          <span>{deck.plays} plays</span>
                          <span>•</span>
                          <span>⭐ {deck.rating}</span>
                        </div>
                      </div>
                      <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${deck.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-lg">Achievements</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="premium-card text-center hover:shadow-elevated transition-all hover:scale-105"
                  >
                    <p className="text-3xl mb-2">{achievement.icon}</p>
                    <p className="font-semibold text-sm mb-1">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Membership Card */}
            <div className="premium-card border-2 border-gradient-primary bg-gradient-to-br from-primary/15 to-secondary/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-base">Premium Member</h3>
                  <Crown className="w-5 h-5 text-primary fill-primary" />
                </div>
                <p className="text-xs text-foreground/70 mb-4 leading-relaxed">
                  Unlock exclusive decks, premium features, and early access to new content.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-primary/50 text-primary hover:bg-primary/10 font-semibold text-sm"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  View Benefits
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="premium-card text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-3 opacity-80" />
            <p className="text-3xl font-bold gradient-text mb-1">{stats.friends}</p>
            <p className="text-sm text-muted-foreground">Friends in Network</p>
          </div>
          <div className="premium-card text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3 opacity-80" />
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">{stats.achievements}</p>
            <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
          </div>
          <div className="premium-card text-center">
            <Zap className="w-8 h-8 text-orange-500 mx-auto mb-3 opacity-80" />
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">7</p>
            <p className="text-sm text-muted-foreground">Day Active Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
};
