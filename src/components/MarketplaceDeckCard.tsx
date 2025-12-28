import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Play, Users } from "lucide-react";
import { useDeckImage } from "@/hooks/useDeckImage";

export interface MarketplaceDeck {
  id: string;
  name: string;
  description: string;
  theme: string;
  cardCount: number;
  price: number;
  isPremium: boolean;
  featured?: boolean;
  category: string;
  plays: number;
  rating?: number;
  totalRatings?: number;
  thumbnailUrl?: string | null;
}

interface MarketplaceDeckCardProps {
  deck: MarketplaceDeck;
  isPurchased: boolean;
  purchaseStatusLoading: boolean;
  onPlay: (deckId: string) => void;
  onPurchase: (deck: MarketplaceDeck) => void;
  formatPrice: (price: number) => string;
  formatPlays: (plays: number) => string;
}

export const MarketplaceDeckCard = ({
  deck,
  isPurchased,
  purchaseStatusLoading,
  onPlay,
  onPurchase,
  formatPrice,
  formatPlays,
}: MarketplaceDeckCardProps) => {
  const { imageSrc } = useDeckImage({
    thumbnailUrl: deck.thumbnailUrl,
    theme: deck.theme,
    name: deck.name,
  });

  return (
    <div className="break-inside-avoid mb-6">
      <div
        className={`group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-glow transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
          deck.featured ? "ring-2 ring-primary/50" : ""
        }`}
        style={{ aspectRatio: deck.featured ? "3/5" : "3/4" }}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt={deck.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

        {deck.featured && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-primary text-primary-foreground px-3 py-1.5 text-sm font-bold">
              ⭐ Popular
            </Badge>
          </div>
        )}

        <div className="absolute top-4 right-4 z-10">
          {deck.isPremium ? (
            <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1.5 text-sm font-semibold">
              <Lock className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          ) : (
            <Badge className="bg-secondary/90 backdrop-blur-sm text-secondary-foreground px-3 py-1.5 text-sm font-semibold">
              Free
            </Badge>
          )}
        </div>

        <div
          className={`absolute inset-x-0 bottom-0 p-5 text-white space-y-2.5 ${
            deck.featured ? "p-6 space-y-3" : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Badge
              variant="outline"
              className="border-white/30 bg-white/10 backdrop-blur-sm text-white text-xs"
            >
              {deck.category}
            </Badge>
            <Badge
              variant="outline"
              className="border-white/30 bg-white/10 backdrop-blur-sm text-white text-xs"
            >
              <Users className="w-3 h-3 mr-1" />
              {formatPlays(deck.plays)} plays
            </Badge>
          </div>

          <h3
            className={`font-bold leading-tight ${
              deck.featured ? "text-2xl line-clamp-3" : "text-xl line-clamp-2"
            }`}
          >
            {deck.name}
          </h3>

          <p
            className={`text-white/85 leading-relaxed ${
              deck.featured ? "text-base line-clamp-3" : "text-sm line-clamp-2"
            }`}
          >
            {deck.description}
          </p>

          <div className="flex items-center justify-between pt-1.5">
            <span className="text-white/75 text-sm font-medium">
              {deck.cardCount} cards
            </span>
            {deck.isPremium && (
              <span
                className={`font-bold text-primary ${
                  deck.featured ? "text-xl" : "text-lg"
                }`}
              >
                {formatPrice(deck.price)}
              </span>
            )}
          </div>

          <div className="pt-3">
            {deck.isPremium ? (
              purchaseStatusLoading ? (
                <Button
                  disabled
                  className={`w-full bg-white/70 text-black/50 font-semibold ${
                    deck.featured ? "h-12 text-base" : "h-10 text-sm"
                  }`}
                >
                  <span className="animate-pulse">Loading...</span>
                </Button>
              ) : isPurchased ? (
                <Button
                  className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold ${
                    deck.featured ? "h-12 text-base" : "h-10 text-sm"
                  }`}
                  onClick={() => onPlay(deck.id)}
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  Play Now
                </Button>
              ) : (
                <Button
                  className={`w-full bg-white hover:bg-white/90 text-black font-semibold ${
                    deck.featured ? "h-12 text-base" : "h-10 text-sm"
                  }`}
                  onClick={() => onPurchase(deck)}
                >
                  <Lock className="w-4 h-4 mr-1.5" />
                  Purchase Deck
                </Button>
              )
            ) : (
              <Button
                className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold ${
                  deck.featured ? "h-12 text-base" : "h-10 text-sm"
                }`}
                onClick={() => onPlay(deck.id)}
              >
                <Play className="w-4 h-4 mr-1.5" />
                Play Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
