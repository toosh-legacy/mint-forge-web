// ✏️ Edit this file to fill in real details — everything in the footer and merch grid reads from here.

export const DEVELOPER = {
  name: "Your Name",
  role: "Creator & Developer of MintForge",
  blurb: "Questions, collabs, press or bug reports — the forge is always lit.",
  email: "hello@example.com",
  links: [
    { label: "GitHub", href: "https://github.com/your-handle", icon: "github" },
    { label: "X / Twitter", href: "https://x.com/your-handle", icon: "x" },
    { label: "Discord", href: "https://discord.gg/your-invite", icon: "discord" },
    { label: "Instagram", href: "https://instagram.com/your-handle", icon: "instagram" },
  ],
} as const;

export const GAME = {
  name: "MintForge Eternal",
  tagline: "Choose your storefront. Your cards follow you everywhere.",
} as const;

export type StoreLink = {
  name: string;
  platforms: string;
  /** ✏️ Replace with the game's own store page. Leave empty ("") to show the store as "Coming soon". */
  href: string;
  /** Badge colour behind the store's monogram. */
  tint: string;
  mark: string;
};

// ✏️ Swap each href for MintForge Eternal's real store page once it's live.
export const STORES: StoreLink[] = [
  { name: "Steam", platforms: "Windows · macOS · Steam Deck", href: "https://store.steampowered.com/", tint: "#1b2838", mark: "St" },
  { name: "itch.io", platforms: "Windows · macOS · Linux · DRM-free", href: "https://itch.io/", tint: "#fa5c5c", mark: "it" },
  { name: "Epic Games Store", platforms: "Windows", href: "https://store.epicgames.com/", tint: "#2a2a2a", mark: "Ep" },
  { name: "GOG", platforms: "Windows · macOS · DRM-free", href: "https://www.gog.com/", tint: "#86328a", mark: "GOG" },
  { name: "Microsoft Store", platforms: "Xbox Series X|S · Windows", href: "https://www.xbox.com/games/store", tint: "#107c10", mark: "Xb" },
  { name: "PlayStation Store", platforms: "PS5", href: "", tint: "#0070d1", mark: "PS" },
  { name: "Nintendo eShop", platforms: "Nintendo Switch 2", href: "", tint: "#e60012", mark: "Ns" },
  { name: "App Store", platforms: "iPhone · iPad", href: "https://apps.apple.com/", tint: "#0d84ff", mark: "iOS" },
  { name: "Google Play", platforms: "Android", href: "https://play.google.com/store/games", tint: "#01875f", mark: "GP" },
];

export type MerchItem = {
  name: string;
  kind: string;
  image: string;
  /** "card" images are portrait card art; "art" are transparent hero cut-outs shown on a stage. */
  fit: "card" | "art";
  tint: string;
  /** For "art" cut-outs: where the subject sits in the 16:9 frame (percent) and how far to zoom in. */
  focus?: { x: number; y: number; zoom: number };
};

export const MERCH: MerchItem[] = [
  { name: "Goldrax Foil Print", kind: "Holo art print · A3", image: "/cards/goldrax-800.webp", fit: "card", tint: "#ff5a2a" },
  { name: "Polyphius Foil Print", kind: "Holo art print · A3", image: "/cards/polyphius-800.webp", fit: "card", tint: "#3fe6d4" },
  { name: "Quasar Foil Print", kind: "Holo art print · A3", image: "/cards/quasar-800.webp", fit: "card", tint: "#8b5cf6" },
  { name: "Sacred Anvil Tee", kind: "Heavyweight cotton", image: "/hero/anvil.webp", fit: "art", tint: "#ff7a2f", focus: { x: 50, y: 66, zoom: 1.45 } },
  { name: "Mint Crystal Pendant", kind: "Resin & brass", image: "/hero/crystal.webp", fit: "art", tint: "#3fe6d4", focus: { x: 51, y: 43, zoom: 4.2 } },
  { name: "Key Art Desk Mat", kind: "900 × 400 mm", image: "/hero/full.webp", fit: "art", tint: "#e9b44c", focus: { x: 50, y: 50, zoom: 1 } },
];
