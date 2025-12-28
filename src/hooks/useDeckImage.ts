import { useState, useEffect } from "react";
import { resolveDeckImageLoader } from "@/lib/deckImages";

interface UseDeckImageProps {
  thumbnailUrl?: string | null;
  theme?: string | null;
  name?: string | null;
}

export const useDeckImage = ({ thumbnailUrl, theme, name }: UseDeckImageProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const load = async () => {
      try {
        const loader = resolveDeckImageLoader({ thumbnailUrl, theme, name });
        const module = await loader();
        if (mounted) {
          setImageSrc(module.default);
        }
      } catch (error) {
        console.error("Failed to load deck image", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [thumbnailUrl, theme, name]);

  return { imageSrc, loading };
};
