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
  Lightbulb,
  Dice6,
  Settings,
  Share2,
  Heart,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { fetchUserStats, DEMO_STATS, UserStats } from "@/lib/userStats";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useAuth();
  const [userName, setUserName] = useState("Player");
  const [userEmail, setUserEmail] = useState("");
  const [userImage, setUserImage] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/auth");
      return;
    }

    if (isLoaded && isSignedIn && user?.id) {
      // Set user profile info from Clerk
      setUserName(user.firstName || user.username || "Player");
      setUserEmail(user.primaryEmailAddress?.emailAddress || "");
      setUserImage(user.imageUrl || null);

      // Fetch real user stats - no demo mode
      fetchUserStats(user.id)
        .then((userStats) => {
          setStats(userStats);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch user stats:", error);
          // Return empty new user stats on error, not demo data
          setStats({
            gamesPlayed: 0,
            totalPoints: 0,
            favoriteDecks: 0,
            winStreak: 0,
            level: 1,
            nextLevelProgress: 0,
            achievements: 0,
            friends: 0,
            isNewUser: true,
            recentActivity: [],
            topDecks: [],
          });
          setLoading(false);
        });
    }
  }, [user, isSignedIn, isLoaded, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-6 rounded-full bg-primary/10 mb-4 animate-pulse">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg text-foreground/70 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-hero pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-foreground/70 font-semibold">Unable to load dashboard</p>
        </div>
      </div>
    );
  }

  const achievements = [
    { icon: "🏆", title: "Champion", desc: "Won 10 games" },
    { icon: "🔥", title: "Streak Master", desc: "5+ win streak" },
    { icon: "💎", title: "Premium Member", desc: "VIP status" },
    { icon: "👥", title: "Social Butterfly", desc: "Played with 50+ friends" },
  ];

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

  return (
    <div className="min-h-screen bg-gradient-hero pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
                  {userImage ? (
                    <img 
                      src={userImage} 
                      alt={userName}
                      className="w-24 h-24 rounded-full border-4 border-primary shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-primary bg-primary/20 flex items-center justify-center">
                      <Users className="w-12 h-12 text-primary" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold gradient-text">{userName}</h1>
                    {userEmail && <p className="text-foreground/70">{userEmail}</p>}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-semibold">Level {stats.level}</span>
                      <span className="px-4 py-2 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-semibold">{stats.totalPoints} XP</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button onClick={() => navigate("/marketplace")} className="flex-1 sm:flex-auto bg-gradient-primary hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 group">
                    <Dice6 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Play Now
                  </Button>
                  <Button variant="outline" className="border-2 border-primary/30 hover:bg-primary/5 font-semibold py-3 px-6 rounded-lg">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Level Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Progress to Level {stats.level + 1}</p>
                  <p className="text-sm font-bold text-primary">{stats.nextLevelProgress}%</p>
                </div>
                <div className="w-full bg-secondary/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-primary h-full rounded-full transition-all duration-500" style={{ width: `${stats.nextLevelProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {!stats.isNewUser && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            <div className="premium-card group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground text-xs font-semibold">GAMES PLAYED</p>
                  <Play className="w-4 h-4 text-primary" />
                </div>
                <p className="text-3xl font-bold gradient-text">{stats.gamesPlayed}</p>
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
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.winStreak}</p>
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
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.favoriteDecks}</p>
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
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.achievements}</p>
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
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.friends}</p>
                <p className="text-xs text-muted-foreground mt-2">In network</p>
              </div>
            </div>
          </div>
        )}

        {/* New User Welcome Section */}
        {stats.isNewUser && (
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
        )}

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

        {/* Recent Activity */}
        {!stats.isNewUser && stats.recentActivity.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-7 h-7 text-primary" />
              <h2 className="text-3xl font-bold">Your Recent Games</h2>
            </div>
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
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
        )}

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
              Start Playing Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
