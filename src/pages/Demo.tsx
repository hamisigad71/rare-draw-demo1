import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Lightbulb,
  Dice6,
  Settings,
  Share2,
  Heart,
  MessageSquare,
  LogOut,
} from "lucide-react";

export const DemoAccount = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is in demo mode
    const isDemoMode = localStorage.getItem("demo_mode") === "true";
    if (!isDemoMode) {
      navigate("/auth");
    }
  }, [navigate]);

  const handleSignOut = () => {
    // Clear demo mode and redirect to auth
    localStorage.removeItem("demo_mode");
    navigate("/auth");
  };

  const quickTips = [
    { icon: "💡", title: "Start with Icebreakers", desc: "New players? Begin with our lighthearted starter decks to get everyone comfortable." },
    { icon: "🎯", title: "Mix Group Sizes", desc: "Different decks work better with 3-6 players. Choose accordingly for the best experience." },
    { icon: "⏱️", title: "Plan Your Time", desc: "Most games take 30-60 minutes. Set aside enough time for full rounds." },
    { icon: "🎭", title: "Set the Mood", desc: "Music, lighting, and snacks enhance the experience. Create the right atmosphere!" },
    { icon: "🤝", title: "Respect Boundaries", desc: "All players should feel comfortable. Know your group and their comfort levels." },
    { icon: "📱", title: "Use the App", desc: "Get game notifications, track scores, and challenge friends through our community features." },
  ];

  const howToPlaySteps = [
    { num: 1, title: "Gather Your Squad", desc: "Invite 3-6 friends for the best experience" },
    { num: 2, title: "Pick Your Deck", desc: "Choose from our curated collection of card games" },
    { num: 3, title: "Set The Mood", desc: "Find a comfortable space and set up your environment" },
    { num: 4, title: "Follow The Cards", desc: "Each card has a challenge or question for players" },
    { num: 5, title: "Have Fun!", desc: "Laugh, connect, and create unforgettable memories" },
  ];

  const demoStats = {
    gamesPlayed: 12,
    winStreak: 3,
    favoriteDecks: 5,
    achievements: 8,
    friends: 24,
    level: 5,
    nextLevelProgress: 65,
    totalPoints: 2450,
    isNewUser: false,
    recentActivity: [
      { id: "1", deck: "Truth or Dare Pro", result: "Won", date: "Today", players: 4, duration: "45 min", points: 150 },
      { id: "2", deck: "Deep Questions", result: "Won", date: "Yesterday", players: 5, duration: "60 min", points: 200 },
      { id: "3", deck: "Fun Challenges", result: "Played", date: "2 days ago", players: 3, duration: "30 min", points: 100 },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-hero pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Sign Out Button */}
        <div className="mb-8 flex justify-end">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-2 border-destructive/30 hover:bg-destructive/5 text-destructive hover:text-destructive font-semibold py-2 px-4 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out Demo
          </Button>
        </div>

        {/* Premium Header with Profile */}
        <div className="mb-12 animate-fade-in">
          <div className="premium-card border-2 border-gradient-primary overflow-hidden relative">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-primary opacity-5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              {/* Profile Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-border/30">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-24 h-24 rounded-full border-4 border-primary bg-gradient-primary/20 flex items-center justify-center">
                    <Users className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold gradient-text">Demo Player</h1>
                    <p className="text-foreground/70">demo@raredraw.com</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-semibold">Level {demoStats.level}</span>
                      <span className="px-4 py-2 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-semibold">{demoStats.totalPoints} XP</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button onClick={() => navigate("/marketplace")} className="flex-1 sm:flex-auto bg-gradient-primary hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 group">
                    <Dice6 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Browse Decks
                  </Button>
                  <Button variant="outline" className="border-2 border-primary/30 hover:bg-primary/5 font-semibold py-3 px-6 rounded-lg">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Level Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Progress to Level {demoStats.level + 1}</p>
                  <p className="text-sm font-bold text-primary">{demoStats.nextLevelProgress}%</p>
                </div>
                <div className="w-full bg-secondary/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-primary h-full rounded-full transition-all duration-500" style={{ width: `${demoStats.nextLevelProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          <div className="premium-card group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground text-xs font-semibold">GAMES PLAYED</p>
                <Play className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-bold gradient-text">{demoStats.gamesPlayed}</p>
              <p className="text-xs text-muted-foreground mt-2">+5 this week</p>
            </div>
          </div>

          <div className="premium-card group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground text-xs font-semibold">WIN STREAK</p>
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{demoStats.winStreak}</p>
              <p className="text-xs text-muted-foreground mt-2">🔥 Keep it going!</p>
            </div>
          </div>

          <div className="premium-card group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground text-xs font-semibold">DECKS OWNED</p>
                <Trophy className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{demoStats.favoriteDecks}</p>
              <p className="text-xs text-muted-foreground mt-2">💎 Collection</p>
            </div>
          </div>

          <div className="premium-card group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground text-xs font-semibold">ACHIEVEMENTS</p>
                <Award className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{demoStats.achievements}</p>
              <p className="text-xs text-muted-foreground mt-2">Unlocked</p>
            </div>
          </div>

          <div className="premium-card group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground text-xs font-semibold">FRIENDS</p>
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{demoStats.friends}</p>
              <p className="text-xs text-muted-foreground mt-2">In network</p>
            </div>
          </div>
        </div>

        {/* Quick Tips Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-7 h-7 text-yellow-500" />
            <h2 className="text-3xl font-bold">💡 Quick Tips & Tricks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickTips.map((tip, idx) => (
              <div key={idx} className="premium-card border-l-4 border-l-primary hover:shadow-elevated transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${0.05 * idx}s` }}>
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{tip.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{tip.title}</h3>
                    <p className="text-sm text-foreground/70">{tip.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Play */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Let's Get You Started! 🚀</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {howToPlaySteps.map((step, idx) => (
              <div key={idx} className="premium-card border-2 border-primary/20 hover:shadow-elevated transition-all hover:-translate-y-1 group animate-fade-in" style={{ animationDelay: `${0.1 * idx}s` }}>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary text-white font-bold text-lg mb-3 group-hover:scale-110 transition-transform">
                  {step.num}
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-foreground/70">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-primary" />
            <h2 className="text-3xl font-bold">Your Recent Games</h2>
          </div>
          <div className="space-y-3">
            {demoStats.recentActivity.map((activity, index) => (
              <div key={activity.id} className="premium-card border-l-4 border-l-primary hover:shadow-elevated transition-all hover:-translate-x-1 group animate-fade-in" style={{ animationDelay: `${0.1 * index}s` }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-lg group-hover:text-primary transition-colors">{activity.deck}</p>
                      <span className="px-3 py-1 bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                        {activity.result}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {activity.date}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {activity.players} players</span>
                      <span>⏱️ {activity.duration}</span>
                      <span className="text-primary font-semibold">+{activity.points} XP</span>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-primary hover:bg-primary/10 group-hover:translate-x-1 transition-all" onClick={() => navigate("/marketplace")}>
                    Browse <Play className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Cards */}
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Browse Decks Card */}
            <div className="premium-card border-2 border-primary/30 hover:shadow-elevated transition-all hover:-translate-y-1 group relative overflow-hidden cursor-pointer" onClick={() => navigate("/marketplace")}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">Browse Decks</h3>
                <p className="text-foreground/70 mb-4">Discover new card games and add them to your collection</p>
                <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Explore <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              </div>
            </div>

            {/* Invite Friends Card */}
            <div className="premium-card border-2 border-secondary/30 hover:shadow-elevated transition-all hover:-translate-y-1 group relative overflow-hidden cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-gradient-secondary text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">Invite Friends</h3>
                <p className="text-foreground/70 mb-4">Challenge your friends and play together in real-time</p>
                <span className="text-secondary font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Invite <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              </div>
            </div>

            {/* Community Card */}
            <div className="premium-card border-2 border-purple-500/30 hover:shadow-elevated transition-all hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">Community</h3>
                <p className="text-foreground/70 mb-4">Join our community, share stories, and make new friends</p>
                <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Join <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="premium-card border-2 border-gradient-primary bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center py-8">
            <h2 className="text-3xl font-bold mb-3">Ready to Create Unforgettable Memories?</h2>
            <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">Pick a deck, gather your friends, and let the fun begin. Every game brings laughter and deeper connections.</p>
            <Button onClick={() => navigate("/marketplace")} className="bg-gradient-primary hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group text-lg">
              <Dice6 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Browse Decks Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoAccount;
