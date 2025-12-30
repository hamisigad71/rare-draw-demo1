import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
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
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { fetchUserStats, DEMO_STATS, UserStats } from "@/lib/userStats";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user, isSignedIn, isLoaded } = useAuth();
  const { toast } = useToast();
  const [userName, setUserName] = useState("Player");
  const [userEmail, setUserEmail] = useState("");
  const [userImage, setUserImage] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [expandGettingStarted, setExpandGettingStarted] = useState(false);

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

  const handleSignOut = async () => {
    try {
      // Sign out from Clerk
      await signOut();
      
      // Show goodbye toast
      toast({
        title: "See you soon! 👋",
        description: "Hate to see you go! Come back and play again soon.",
        duration: 3000,
      });
      
      // Redirect to home
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      console.error("Sign out failed:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

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
        {/* Premium Hero Section */}
        <div className="mb-12 animate-fade-in">
          <div className="relative overflow-hidden rounded-3xl">
            {/* Clean Solid Background */}
            <div className="absolute inset-0 z-0 bg-background" />

            {/* Main Content Card */}
            <div className="relative z-10 bg-gradient-to-br from-background to-background backdrop-blur-xl border border-primary/20 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-transparent" />
              
              <div className="relative z-20 p-6 md:p-12 lg:p-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                  {/* Left Section - Main Profile (1 col) */}
                  <div className="space-y-6">
                    {/* Header with Greeting */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75" />
                          <div className="relative bg-background rounded-full p-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary uppercase tracking-widest">
                          Welcome back, Champion
                        </p>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                        <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary">
                          {userName}
                        </span>
                      </h1>
                      <p className="text-foreground/70 text-lg">
                        {stats.isNewUser 
                          ? "Your gaming adventure awaits! 🚀" 
                          : `You've played ${stats.gamesPlayed} amazing games`}
                      </p>
                    </div>

                    {/* Enhanced Level Progress Card */}
                    <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground/80">Level {stats.level}</p>
                          <p className="text-xs text-foreground/60">Next milestone in reach</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            {stats.nextLevelProgress}%
                          </p>
                          <p className="text-xs text-primary font-semibold">{stats.totalPoints} XP earned</p>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full overflow-hidden border border-primary/30 shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-primary via-purple-500 to-secondary rounded-full transition-all duration-1000 ease-out shadow-lg relative"
                          style={{ width: `${stats.nextLevelProgress}%` }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-8">
                      <Button 
                        onClick={() => navigate("/marketplace")}
                        className="bg-gradient-to-r from-primary to-secondary hover:shadow-elevated text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 group text-base flex-1 sm:flex-auto border border-primary/50"
                      >
                        <Dice6 className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                        Start Playing
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-2 border-primary/50 hover:bg-primary/10 font-bold py-3 px-8 rounded-xl transition-all duration-300 group text-base flex-1 sm:flex-auto backdrop-blur-sm"
                      >
                        <Share2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Invite Friends
                      </Button>
                      <Button 
                        onClick={() => setShowSignOutDialog(true)}
                        variant="outline"
                        className="border-2 border-red-500/40 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold py-3 px-6 rounded-xl transition-all duration-300 group text-base"
                      >
                        <LogOut className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                  {/* Right Section - Profile & Stats */}
                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      {/* User Avatar & Quick Info */}
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                        <div className="relative bg-gradient-to-br from-background to-background/80 backdrop-blur-xl border border-primary/30 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              {userImage ? (
                                <img 
                                  src={userImage} 
                                  alt={userName}
                                  className="w-20 h-20 rounded-xl border-4 border-gradient-primary shadow-lg object-cover"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-xl border-4 border-gradient-primary bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
                                  <Crown className="w-10 h-10 text-white" />
                                </div>
                              )}
                              <div className="space-y-2">
                                <p className="text-sm text-foreground/70">Player Status</p>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                  <p className="text-sm font-bold text-green-500">Active Now</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                {stats.level}
                              </p>
                              <p className="text-xs text-foreground/60 font-bold">LEVEL</p>
                            </div>
                          </div>
                          <div className="h-px bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 mb-4" />
                          <p className="text-sm text-foreground/70 text-center">
                            {stats.isNewUser 
                              ? "Fresh player - Ready to shine! ✨" 
                              : `${stats.gamesPlayed} games played • ${stats.friends} friends`}
                          </p>
                        </div>
                      </div>

                      {/* Stats Cards Grid */}
                      {!stats.isNewUser && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative group overflow-hidden rounded-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm hover:shadow-lg transition-all">
                              <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                  <Play className="w-5 h-5 text-blue-500" />
                                </div>
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Games</span>
                              </div>
                              <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{stats.gamesPlayed}</p>
                            </div>
                          </div>
                          
                          <div className="relative group overflow-hidden rounded-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm hover:shadow-lg transition-all">
                              <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                  <Trophy className="w-5 h-5 text-purple-500" />
                                </div>
                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Wins</span>
                              </div>
                              <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{stats.achievements}</p>
                            </div>
                          </div>

                          <div className="relative group overflow-hidden rounded-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm hover:shadow-lg transition-all">
                              <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-green-500" />
                                </div>
                                <span className="text-xs font-bold text-green-600 dark:text-green-400">Friends</span>
                              </div>
                              <p className="text-3xl font-black text-green-600 dark:text-green-400">{stats.friends}</p>
                            </div>
                          </div>

                          <div className="relative group overflow-hidden rounded-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm hover:shadow-lg transition-all">
                              <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                  <Star className="w-5 h-5 text-amber-500" />
                                </div>
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">XP</span>
                              </div>
                              <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{Math.floor(stats.totalPoints / 100)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {stats.isNewUser && (
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                          <div className="relative bg-gradient-to-br from-background to-background/80 backdrop-blur-xl border border-primary/30 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
                            <div className="space-y-3 text-center">
                              <Sparkles className="w-8 h-8 text-primary mx-auto animate-bounce" />
                              <p className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Ready to Begin?</p>
                              <p className="text-sm text-foreground/70">Start your first game and unlock amazing rewards</p>
                              <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New User Welcome Section - Collapsible */}
        {stats.isNewUser && (
          <div className="mb-12">
            {/* Collapsible Header */}
            <button
              onClick={() => setExpandGettingStarted(!expandGettingStarted)}
              className="w-full mb-6 group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary text-white flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                      🚀
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Let's Get You Started!
                      </h2>
                      <p className="text-sm text-foreground/70 mt-1">
                        {expandGettingStarted ? "Click to collapse" : "5 simple steps to begin your adventure"}
                      </p>
                    </div>
                  </div>
                  <div className={`text-primary transition-transform duration-300 ${expandGettingStarted ? "rotate-180" : ""}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            {/* Expandable Content */}
            <div className={`overflow-hidden transition-all duration-500 ease-out ${expandGettingStarted ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="space-y-4">
                {howToPlaySteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-background to-background/50 border border-primary/20 hover:border-primary/40 transition-all duration-300 p-6 hover:shadow-lg hover:-translate-x-1"
                    style={{
                      animation: expandGettingStarted ? `slideIn 0.3s ease-out ${idx * 0.1}s forwards` : "none",
                      opacity: expandGettingStarted ? 1 : 0,
                    }}
                  >
                    {/* Gradient accent line on left */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex gap-6 items-start">
                      {/* Step Number Circle */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary text-white font-bold text-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          {step.num}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-foreground/70 mt-2 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                      
                      {/* Arrow icon on hover */}
                      <div className="flex-shrink-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Motivational footer */}
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 text-center">
                <p className="text-foreground/80 font-semibold">
                  Follow these steps and you'll be ready to create unforgettable memories! ✨
                </p>
              </div>
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

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent className="border-2 border-primary/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Sign Out?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to leave? We'd love to have you back soon! 👋
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-primary/40 font-bold">
              Stay
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
