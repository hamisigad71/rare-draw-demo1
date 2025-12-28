import { Link, useNavigate } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Library, Sparkles, Store, Menu, X, Trophy, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import logo from "@/assets/raredraw.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          >
            <div className="relative">
              <img 
                src={logo} 
                alt="RareDraw" 
                className="h-10 w-10 rounded-lg object-cover group-hover:drop-shadow-lg transition-all duration-300" 
              />
            </div>
            <span className="font-bold text-xl gradient-text hidden sm:inline-block font-['Playfair_Display']">
              RareDraw
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/marketplace">
              <Button 
                variant="ghost" 
                className="gap-2 text-foreground/80 hover:text-foreground hover:bg-primary/5 font-medium transition-all duration-300"
              >
                <Store className="w-4 h-4" />
                Marketplace
              </Button>
            </Link>

            {isSignedIn && (
              <>
                <Link to="/library">
                  <Button 
                    variant="ghost" 
                    className="gap-2 text-foreground/80 hover:text-foreground hover:bg-secondary/5 font-medium transition-all duration-300"
                  >
                    <Library className="w-4 h-4" />
                    My Library
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-foreground/80 hover:text-foreground hover:bg-primary/5 transition-all duration-300"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hidden sm:inline-flex text-foreground/80 hover:text-foreground hover:bg-primary/5 transition-all duration-300"
                  aria-label="Profile"
                >
                  <Trophy className="w-5 h-5" />
                </Button>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 hover:ring-2 hover:ring-primary transition-all duration-300",
                      userButtonBox: "flex-row-reverse",
                    },
                  }}
                />
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/auth")}
                  className="hidden sm:inline-flex gap-2 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  size="icon"
                  className="sm:hidden border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300"
                  aria-label="Sign in"
                >
                  <Sparkles className="w-5 h-5" />
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground hover:bg-primary/10 transition-all duration-300"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border/50 bg-gradient-card animate-fade-in">
            <div className="px-4 py-4 space-y-2">
              <Link to="/marketplace" onClick={() => setIsOpen(false)}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 text-foreground/80 hover:text-foreground hover:bg-primary/10"
                >
                  <Store className="w-4 h-4" />
                  Marketplace
                </Button>
              </Link>
              {isSignedIn && (
                <Link to="/library" onClick={() => setIsOpen(false)}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 text-foreground/80 hover:text-foreground hover:bg-secondary/10"
                  >
                    <Library className="w-4 h-4" />
                    My Library
                  </Button>
                </Link>
              )}
              {!isSignedIn && (
                <Button
                  onClick={() => {
                    navigate("/auth");
                    setIsOpen(false);
                  }}
                  className="w-full gap-2 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold mt-4"
                >
                  <Sparkles className="w-4 h-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
