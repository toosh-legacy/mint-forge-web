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
