import { Spade, Heart, Diamond, Club } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/raredraw.png";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card/50 border-t border-border/50 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logo}
                alt="RareDraw"
                className="h-12 w-auto rounded-md"
              />
              <span className="text-2xl font-bold font-['Cinzel'] text-foreground">
                RareDraw
              </span>
            </div>
            <p className="text-muted-foreground mb-4">
              Where every card tells a story and every moment becomes a memory.
              Connecting hearts through meaningful conversation.
            </p>
            <div className="flex gap-3">
              <Spade className="h-5 w-5 text-primary" />
              <Heart className="h-5 w-5 text-primary" />
              <Diamond className="h-5 w-5 text-primary" />
              <Club className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Themed Decks
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:play@raredraw.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50 text-center text-muted-foreground">
          <p>
            &copy; {currentYear} RareDraw. All rights reserved. Connect
            meaningfully.
          </p>
        </div>
      </div>
    </footer>
  );
};
