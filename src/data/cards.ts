export type ForgeCard = {
  slug: string;
  number: string;
  name: string;
  epithet: string;
  atk: number;
  def: number;
  ult: string;
  lore: string;
  image: { sm: string; lg: string };
  /** Accent used for the panel tint, glow and foil. */
  accent: string;
  accentSoft: string;
};

// Transcribed from the card masters in /assests.
export const CARDS: ForgeCard[] = [
  {
    slug: "goldrax",
    number: "001",
    name: "Goldrax the Dread",
    epithet: "The Dragon God",
    atk: 5000,
    def: 5000,
    ult: "Cataclysmic Dreadflame",
    lore: "The dragon god who bestowed his fury upon the first cards, igniting their rage. His power fuels the infernal will to conquer, battle, and never yield.",
    image: { sm: "/cards/goldrax-800.webp", lg: "/cards/goldrax-1400.webp" },
    accent: "#ff5a2a",
    accentSoft: "rgba(255, 90, 42, 0.28)",
  },
  {
    slug: "polyphius",
    number: "002",
    name: "Polyphius Forgeknight",
    epithet: "The Titan of the First Forge",
    atk: 5000,
    def: 5000,
    ult: "Armorer's Machinations",
    lore: "The titan who created the first forge, where living entities became bound to cards. From his sacred anvil the first cards were born, beginning an eternal legacy.",
    image: { sm: "/cards/polyphius-800.webp", lg: "/cards/polyphius-1400.webp" },
    accent: "#3fe6d4",
    accentSoft: "rgba(63, 230, 212, 0.26)",
  },
  {
    slug: "quasar",
    number: "003",
    name: "Quasar Regent",
    epithet: "The Cosmic God",
    atk: 5000,
    def: 5000,
    ult: "Dark Matter Quantum Fold",
    lore: "The cosmic god who breathed life into the cards forged before him. His celestial magic fuels the rituals, granting evolution and greater power.",
    image: { sm: "/cards/quasar-800.webp", lg: "/cards/quasar-1400.webp" },
    accent: "#8b5cf6",
    accentSoft: "rgba(139, 92, 246, 0.3)",
  },
];
