import { Card, CardContent } from "@/components/ui/card";
import { Heart, Briefcase, Users, Sparkles, Gamepad2, Globe } from "lucide-react";

const deckThemes = [
  {
    icon: Heart,
    name: "Romance",
    description: "Heart-warming prompts and challenges for couples and date nights",
    rarity: "Premium Collection"
  },
  {
    icon: Briefcase,
    name: "Work & Career",
    description: "Professional development and team-building scenarios for the workplace",
    rarity: "Executive Edition"
  },
  {
    icon: Users,
    name: "Friendship",
    description: "Strengthen bonds with fun challenges and deep conversation starters",
    rarity: "Classic Collection"
  },
  {
    icon: Sparkles,
    name: "Party & Events",
    description: "Icebreakers and entertainment for any social gathering",
    rarity: "Celebration Pack"
  },
  {
    icon: Gamepad2,
    name: "Adventure",
    description: "Story-driven scenarios and role-playing challenges",
    rarity: "Epic Series"
  },
  {
    icon: Globe,
    name: "Cultural Discovery",
    description: "Explore traditions, customs, and perspectives from around the world",
    rarity: "World Tour"
  }
];

export const GameTypes = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Explore Themed Decks
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            One game, infinite possibilities. Choose from premium themed card decks designed for every occasion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {deckThemes.map((deck, index) => (
            <Card 
              key={index} 
              className="bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:scale-105 group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="mb-4 inline-block p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <deck.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2 gradient-text">
                  {deck.name}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {deck.description}
                </p>
                <div className="flex items-center text-sm text-primary font-medium">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {deck.rarity}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
