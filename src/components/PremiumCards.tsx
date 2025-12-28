import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Share2 } from "lucide-react";
import { ReactNode } from "react";

interface PremiumGameCardProps {
  deckName: string;
  cardTitle: string;
  cardContent: string;
  category?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  rarity?: "Common" | "Rare" | "Epic" | "Legendary";
  isLocked?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  icon?: ReactNode;
}

export const PremiumGameCard = ({
  deckName,
  cardTitle,
  cardContent,
  category = "Challenge",
  difficulty = "Medium",
  rarity = "Rare",
  isLocked = false,
  onAction,
  actionLabel = "Next Card",
  icon,
}: PremiumGameCardProps) => {
  const rarityColors = {
    Common: "from-slate-400 to-slate-500",
    Rare: "from-blue-400 to-blue-500",
    Epic: "from-purple-400 to-purple-500",
    Legendary: "from-amber-400 to-amber-500",
  };

  const difficultyColors = {
    Easy: "text-green-500 bg-green-500/10",
    Medium: "text-amber-500 bg-amber-500/10",
    Hard: "text-red-500 bg-red-500/10",
  };

  return (
    <Card className="relative w-full max-w-2xl mx-auto overflow-hidden border-0 shadow-elevated hover:shadow-lg transition-all duration-500 group">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[rarity]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

      {/* Shimmer effect */}
      <div className="absolute inset-0 shine-effect" />

      <CardContent className="relative z-10 p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-widest">
                {deckName}
              </p>
              <h3 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                {cardTitle}
              </h3>
            </div>
            {icon && (
              <div className="text-4xl ml-4">
                {icon}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
              {category}
            </span>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${difficultyColors[difficulty]}`}>
              {difficulty}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${rarityColors[rarity]} text-white`}>
              {rarity}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="bg-background/40 backdrop-blur-sm border border-border/30 rounded-xl p-6 md:p-8 mb-8">
          <p className="text-lg md:text-xl leading-relaxed text-foreground/90 font-light">
            {cardContent}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onAction}
            disabled={isLocked}
            className="flex-1 bg-gradient-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold py-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-base"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {actionLabel}
          </Button>
          <Button
            variant="outline"
            className="sm:flex-none border-2 border-primary/30 hover:bg-primary/5 font-semibold px-6 py-6 rounded-lg transition-all duration-300"
            title="Save card"
          >
            <Heart className="w-5 h-5 text-primary" />
          </Button>
          <Button
            variant="outline"
            className="sm:flex-none border-2 border-secondary/30 hover:bg-secondary/5 font-semibold px-6 py-6 rounded-lg transition-all duration-300"
            title="Share card"
          >
            <Share2 className="w-5 h-5 text-secondary" />
          </Button>
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <p className="font-semibold text-lg">Premium Content</p>
              <p className="text-sm text-muted-foreground mt-1">Upgrade to unlock this card</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Deck Card component for marketplace and library
interface DeckCardProps {
  name: string;
  description: string;
  cardCount: number;
  players: string;
  difficulty: "Easy" | "Medium" | "Hard";
  price?: number;
  isPremium?: boolean;
  image?: string;
  onClick?: () => void;
}

export const DeckCard = ({
  name,
  description,
  cardCount,
  players,
  difficulty,
  price,
  isPremium = false,
  image,
  onClick,
}: DeckCardProps) => {
  const difficultyColors = {
    Easy: "text-green-500",
    Medium: "text-amber-500",
    Hard: "text-red-500",
  };

  return (
    <Card
      onClick={onClick}
      className="premium-card cursor-pointer group overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-elevated"
    >
      {/* Image */}
      {image && (
        <div className="relative h-48 overflow-hidden bg-gradient-primary">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {isPremium && (
            <div className="absolute top-3 right-3 bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Premium
            </div>
          )}
        </div>
      )}

      <CardContent className="flex-1 p-6 flex flex-col">
        <h3 className="text-2xl font-bold mb-2 group-hover:gradient-text transition-colors">
          {name}
        </h3>

        <p className="text-foreground/70 text-sm mb-4 flex-1">
          {description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-border/30 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{cardCount}</p>
            <p className="text-xs text-muted-foreground">Cards</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">{players}</p>
            <p className="text-xs text-muted-foreground">Players</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${difficultyColors[difficulty]}`}>
              {difficulty[0]}
            </p>
            <p className="text-xs text-muted-foreground">{difficulty}</p>
          </div>
        </div>

        {/* Action button */}
        <Button className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold rounded-lg transition-all duration-300 group-hover:shadow-lg">
          {price ? `$${price}` : "Play Now"}
          <Sparkles className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
