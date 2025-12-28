import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Users } from "lucide-react";
import { useDeckImage } from "@/hooks/useDeckImage";
import { OwnedDeckSummary } from "@/repositories/libraryRepository";

interface LibraryDeckCardProps {
  deck: OwnedDeckSummary;
}

export const LibraryDeckCard = ({ deck }: LibraryDeckCardProps) => {
  const navigate = useNavigate();
  const { imageSrc } = useDeckImage({
    thumbnailUrl: deck.thumbnail_url,
    theme: deck.theme,
    name: deck.name,
  });

  const formatPlays = (plays: number | null | undefined) => {
    if (!plays) return "0";
    if (plays >= 1000) {
      return `${(plays / 1000).toFixed(1)}k`;
    }
    return plays.toString();
  };

  return (
    <div className="break-inside-avoid mb-6">
      <div
        className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-glow transition-all duration-300 cursor-pointer hover:scale-[1.02]"
        style={{ aspectRatio: "3/4" }}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt={deck.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-secondary/90 backdrop-blur-sm text-secondary-foreground px-3 py-1.5 text-sm font-semibold">
            Owned
          </Badge>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white space-y-2.5">
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

          <h3 className="font-bold text-xl leading-tight line-clamp-2">
            {deck.name}
          </h3>

          <p className="text-white/85 text-sm leading-relaxed line-clamp-2">
            {deck.description}
          </p>

          <div className="flex items-center justify-between pt-1.5">
            <span className="text-white/75 text-sm font-medium">
              {(deck.card_count ?? 0).toLocaleString()} cards
            </span>
          </div>

          <div className="pt-3">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 text-sm"
              onClick={() => navigate(`/game?deck=${deck.id}`)}
            >
              <Play className="w-4 h-4 mr-1.5" />
              Play Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
