import { Sparkles } from "lucide-react";

const deckThemes = [
  {
    emoji: "❤️",
    name: "Romance",
    description: "Heart-warming prompts and challenges for couples and date nights",
    rarity: "Premium Collection"
  },
  {
    emoji: "💼",
    name: "Work & Career",
    description: "Professional development and team-building scenarios for the workplace",
    rarity: "Executive Edition"
  },
  {
    emoji: "👥",
    name: "Friendship",
    description: "Strengthen bonds with fun challenges and deep conversation starters",
    rarity: "Classic Collection"
  },
  {
    emoji: "🎉",
    name: "Party & Events",
    description: "Icebreakers and entertainment for any social gathering",
    rarity: "Celebration Pack"
  },
  {
    emoji: "🎮",
    name: "Adventure",
    description: "Story-driven scenarios and role-playing challenges",
    rarity: "Epic Series"
  },
  {
    emoji: "🌍",
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {deckThemes.map((deck, index) => (
            <div 
              key={index} 
              className="premium-card border-l-4 border-l-primary hover:shadow-elevated transition-all hover:-translate-y-1 group cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">
                  {deck.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 gradient-text">
                    {deck.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {deck.description}
                  </p>
                  <div className="flex items-center text-xs text-primary font-medium">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {deck.rarity}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
