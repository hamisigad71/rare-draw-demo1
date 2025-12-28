
const deckImageMap = {
  "deck-icebreaker": () => import("@/assets/deck-icebreaker.jpg"),
  "deck-deep": () => import("@/assets/deck-deep.jpg"),
  "deck-adventure": () => import("@/assets/deck-adventure.jpg"),
  "deck-romance": () => import("@/assets/deck-romance.jpg"),
  "deck-family": () => import("@/assets/deck-family.jpg"),
  "deck-career": () => import("@/assets/deck-career.jpg"),
  "deck-wellness": () => import("@/assets/deck-wellness.jpg"),
  "deck-creative": () => import("@/assets/deck-creative.jpg"),
  "deck-foodie": () => import("@/assets/deck-foodie.jpg"),
  "deck-music": () => import("@/assets/deck-music.jpg"),
  "deck-movies": () => import("@/assets/deck-movies.jpg"),
  "deck-sports": () => import("@/assets/deck-sports.jpg"),
  "deck-books": () => import("@/assets/deck-books.jpg"),
  "deck-pets": () => import("@/assets/deck-pets.jpg"),
  "deck-tech": () => import("@/assets/deck-tech.jpg"),
  "deck-nature": () => import("@/assets/deck-nature.jpg"),
  "deck-party": () => import("@/assets/deck-party.jpg"),
  "deck-childhood": () => import("@/assets/deck-childhood.jpg"),
  "deck-cultures": () => import("@/assets/deck-cultures.jpg"),
  "deck-dreams": () => import("@/assets/deck-dreams.jpg"),
  "deck-mystery": () => import("@/assets/deck-mystery.jpg"),
  "deck-fashion": () => import("@/assets/deck-fashion.jpg"),
  "deck-science": () => import("@/assets/deck-science.jpg"),
  "deck-history": () => import("@/assets/deck-history.jpg"),
} as const;

// Fallback can also be dynamic or we can keep a tiny placeholder inline if needed.
// For now, let's make it point to icebreaker as before.
const deckImageFallback = deckImageMap["deck-icebreaker"];

type DeckImageKey = keyof typeof deckImageMap;

type ResolveDeckImageArgs = {
  thumbnailUrl?: string | null;
  theme?: string | null;
  name?: string | null;
};

const aliasEntries: Array<[string, DeckImageKey]> = [
  ["icebreaker", "deck-icebreaker"],
  ["ultimate-icebreakers", "deck-icebreaker"],
  ["ultimate-icebreaker", "deck-icebreaker"],
  ["classic-icebreakers", "deck-icebreaker"],
  ["light-fun", "deck-icebreaker"],
  ["light-and-fun", "deck-icebreaker"],
  ["deep", "deck-deep"],
  ["deep-conversations", "deck-deep"],
  ["deep-convo", "deck-deep"],
  ["thoughtful-meaningful", "deck-deep"],
  ["thoughtful-and-meaningful", "deck-deep"],
  ["adventure", "deck-adventure"],
  ["adventure-exploration", "deck-adventure"],
  ["adventure-and-exploration", "deck-adventure"],
  ["travel", "deck-adventure"],
  ["travel-tales", "deck-adventure"],
  ["romance", "deck-romance"],
  ["date-night", "deck-romance"],
  ["date-night-deluxe", "deck-romance"],
  ["romance-connection", "deck-romance"],
  ["family", "deck-family"],
  ["family-fun-night", "deck-family"],
  ["family-night", "deck-family"],
  ["all-ages", "deck-family"],
  ["career", "deck-career"],
  ["career-ambitions", "deck-career"],
  ["career-and-ambitions", "deck-career"],
  ["professional-growth", "deck-career"],
  ["wellness", "deck-wellness"],
  ["self-care", "deck-wellness"],
  ["creative", "deck-creative"],
  ["creative-minds", "deck-creative"],
  ["art-imagination", "deck-creative"],
  ["art-and-imagination", "deck-creative"],
  ["food", "deck-foodie"],
  ["foodie", "deck-foodie"],
  ["foodie-favorites", "deck-foodie"],
  ["culinary", "deck-foodie"],
  ["culinary-conversations", "deck-foodie"],
  ["music", "deck-music"],
  ["movie-night", "deck-movies"],
  ["film", "deck-movies"],
  ["cinema", "deck-movies"],
  ["movies", "deck-movies"],
  ["sports", "deck-sports"],
  ["sport", "deck-sports"],
  ["books", "deck-books"],
  ["book-club", "deck-books"],
  ["reading", "deck-books"],
  ["pets", "deck-pets"],
  ["animals", "deck-pets"],
  ["animal", "deck-pets"],
  ["tech", "deck-tech"],
  ["technology", "deck-tech"],
  ["geek", "deck-tech"],
  ["nature", "deck-nature"],
  ["outdoors", "deck-nature"],
  ["green", "deck-nature"],
  ["party", "deck-party"],
  ["party-starters", "deck-party"],
  ["party-games", "deck-party"],
  ["high-energy", "deck-party"],
  ["childhood", "deck-childhood"],
  ["nostalgic", "deck-childhood"],
  ["nostalgic-moments", "deck-childhood"],
  ["memory-lane", "deck-childhood"],
  ["cultures", "deck-cultures"],
  ["culture", "deck-cultures"],
  ["global", "deck-cultures"],
  ["world", "deck-cultures"],
  ["dream", "deck-dreams"],
  ["dreams", "deck-dreams"],
  ["future-dreams", "deck-dreams"],
  ["mystery", "deck-mystery"],
  ["detective", "deck-mystery"],
  ["fashion", "deck-fashion"],
  ["style", "deck-fashion"],
  ["science", "deck-science"],
  ["scientist", "deck-science"],
  ["stem", "deck-science"],
  ["history", "deck-history"],
  ["historical", "deck-history"],
  ["past", "deck-history"],
];

const aliasMap = aliasEntries.reduce<Record<string, DeckImageKey>>(
  (result, [key, value]) => {
    result[key] = value;
    return result;
  },
  {}
);

Object.keys(deckImageMap).forEach((key) => {
  const deckKey = key as DeckImageKey;
  aliasMap[key] = deckKey;

  const trimmed = key.startsWith("deck-") ? key.replace(/^deck-/, "") : key;
  aliasMap[trimmed] = deckKey;
});

const normalizeKey = (value?: string | null) => {
  if (!value) {
    return null;
  }

  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
};

const extractFileStem = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const sanitized = value.split("?")[0] ?? value;
  const fileName = sanitized.split("/").filter(Boolean).pop();
  if (!fileName) {
    return null;
  }

  return fileName.replace(/\.[^/.]+$/, "");
};

const findImageLoaderByKey = (rawKey?: string | null) => {
  const normalized = normalizeKey(rawKey);
  if (!normalized) {
    return null;
  }

  const mapKey = aliasMap[normalized];
  if (!mapKey) {
    return null;
  }

  return deckImageMap[mapKey];
};

export const resolveDeckImageLoader = (args: ResolveDeckImageArgs = {}) => {
  const { thumbnailUrl, theme, name } = args;

  const fromThumbnail = findImageLoaderByKey(extractFileStem(thumbnailUrl));
  if (fromThumbnail) {
    return fromThumbnail;
  }

  const fromTheme = findImageLoaderByKey(theme);
  if (fromTheme) {
    return fromTheme;
  }

  const fromName = findImageLoaderByKey(name);
  if (fromName) {
    return fromName;
  }

  return deckImageFallback;
};

export { deckImageFallback, deckImageMap };
