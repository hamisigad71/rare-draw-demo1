import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Lock, User, Zap } from "lucide-react";
import logo from "@/assets/raredraw.png";

const Auth = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/");
    }
  }, [isLoaded, isSignedIn, navigate]);

  const handleDemoSignIn = () => {
    setIsDemo(true);
    // Store demo mode in localStorage
    localStorage.setItem("demo_mode", "true");
    navigate("/demo");
  };

  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden flex items-center justify-center p-4">
      <style>{`
        /* Clerk SignIn Styling */
        .clerk-signin-wrapper .cl-cardBox__header {
          display: none !important;
        }
        
        .clerk-signin-wrapper .cl-card {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        .clerk-signin-wrapper .cl-form__header {
          display: none !important;
        }

        .clerk-signin-wrapper .cl-form__subtitle,
        .clerk-signin-wrapper .cl-card h1,
        .clerk-signin-wrapper .cl-card h2,
        .clerk-signin-wrapper .cl-card p,
        .clerk-signin-wrapper .cl-card span {
          color: white !important;
        }

        /* Clerk SignUp Styling */
        .clerk-signup-wrapper .cl-cardBox__header {
          display: none !important;
        }
        
        .clerk-signup-wrapper .cl-card {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        .clerk-signup-wrapper .cl-form__header {
          display: none !important;
        }

        .clerk-signup-wrapper .cl-form__subtitle,
        .clerk-signup-wrapper .cl-card h1,
        .clerk-signup-wrapper .cl-card h2,
        .clerk-signup-wrapper .cl-card p,
        .clerk-signup-wrapper .cl-card span {
          color: white !important;
        }
      `}</style>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Premium branding */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 animate-fade-in">
            <div>
              <img src={logo} alt="RareDraw" className="h-24 w-24 rounded-2xl drop-shadow-2xl mb-6" />
              <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
                RareDraw
              </h1>
              <p className="text-xl text-foreground/80 font-light mb-6 leading-relaxed">
                The ultimate card game experience designed for adults who love to connect, laugh, and create unforgettable memories.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg mt-1">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Premium Decks</h3>
                  <p className="text-foreground/70">Carefully curated card collections for every mood and occasion</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-lg mt-1">
                  <User className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Connect & Play</h3>
                  <p className="text-foreground/70">Build deeper connections through thoughtful gameplay</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg mt-1">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Your Privacy Matters</h3>
                  <p className="text-foreground/70">Secure, private gaming environment for you and your friends</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="w-full animate-fade-in">
            <div className="premium-card border-2 border-border/30 backdrop-blur-sm">
              <div className="text-center mb-8 lg:hidden">
                <img src={logo} alt="RareDraw" className="h-16 w-16 rounded-xl mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2 gradient-text">RareDraw</h2>
                <p className="text-muted-foreground">Turn any night into game night</p>
              </div>

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/5 p-1 rounded-lg">
                  <TabsTrigger 
                    value="signin"
                    className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-foreground/70 hover:bg-primary/10 font-semibold rounded-md transition-all duration-300 text-white"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-gradient-secondary data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-foreground/70 hover:bg-secondary/10 font-semibold rounded-md transition-all duration-300 text-white"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <p className="text-sm text-white text-center mb-6">
                    Welcome back! Sign in to your account to continue your gaming journey
                  </p>
                  <div className="clerk-signin-wrapper">
                    <SignIn
                      appearance={{
                        elements: {
                          rootBox: "w-full",
                          card: "shadow-none border-none bg-transparent",
                          formFieldLabel: "text-sm font-semibold text-foreground mb-2",
                          formFieldInput: "w-full px-4 py-3 rounded-lg border-2 border-border/30 bg-background/40 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 font-medium",
                          formButtonPrimary: "w-full py-3 px-4 rounded-lg bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-300 text-base",
                          dividerLine: "bg-gradient-to-r from-transparent via-border/40 to-transparent",
                          dividerText: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                          socialButtonsBlockButton: "w-full px-4 py-3 rounded-lg border-2 border-border/40 bg-background/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 font-medium text-foreground shadow-sm hover:shadow-md",
                          socialButtonsBlockButtonText: "text-sm font-semibold text-foreground",
                          footerActionText: "text-xs text-muted-foreground font-medium",
                          footerActionLink: "text-primary font-semibold hover:text-primary/80 transition-colors",
                        },
                        layout: {
                          socialButtonsVariant: "blockButton",
                          socialButtonsPlacement: "bottom",
                        },
                      }}
                      redirectUrl="/"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <p className="text-sm text-white text-center mb-6">
                    Join RareDraw and start creating amazing memories with your friends
                  </p>
                  <div className="clerk-signup-wrapper">
                    <SignUp
                      appearance={{
                        elements: {
                          rootBox: "w-full",
                          card: "shadow-none border-none bg-transparent",
                          formFieldLabel: "text-sm font-semibold text-foreground mb-2",
                          formFieldInput: "w-full px-4 py-3 rounded-lg border-2 border-border/30 bg-background/40 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 font-medium",
                          formButtonPrimary: "w-full py-3 px-4 rounded-lg bg-gradient-secondary text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-300 text-base",
                          dividerLine: "bg-gradient-to-r from-transparent via-border/40 to-transparent",
                          dividerText: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                          socialButtonsBlockButton: "w-full px-4 py-3 rounded-lg border-2 border-border/40 bg-background/30 hover:bg-secondary/5 hover:border-secondary/50 transition-all duration-200 font-medium text-foreground shadow-sm hover:shadow-md",
                          socialButtonsBlockButtonText: "text-sm font-semibold text-foreground",
                          footerActionText: "text-xs text-muted-foreground font-medium",
                          footerActionLink: "text-secondary font-semibold hover:text-secondary/80 transition-colors",
                        },
                        layout: {
                          socialButtonsVariant: "blockButton",
                          socialButtonsPlacement: "bottom",
                        },
                      }}
                      redirectUrl="/"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 pt-6 border-t border-border/20 space-y-4">
                <button
                  onClick={handleDemoSignIn}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Try Demo Instantly
                </button>
                <p className="text-xs text-center text-muted-foreground">
                  By signing in or creating an account, you agree to our{" "}
                  <a href="/terms-of-service" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </a>
                  {" "}and{" "}
                  <a href="/privacy-policy" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
