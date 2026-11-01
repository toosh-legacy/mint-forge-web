"use client";

import Image from "next/image";
import type { ForgeCard } from "@/data/cards";

/** Back face of a split panel: the card art on a tinted forge backdrop, lore on liquid glass. */
export function CardBack({ card, compact }: { card: ForgeCard; compact: boolean }) {
  const backdrop = {
    background: `radial-gradient(90% 60% at 50% 30%, ${card.accentSoft}, transparent 70%), #15191a`,
  };

  if (compact) {
    return (
      <div className="flex h-full items-center gap-4 p-4" style={backdrop}>
        <div className="relative aspect-[3000/4236] h-full shrink-0">
          <Image
            src={card.image.sm}
            alt={card.name}
            fill
            sizes="200px"
            className="object-contain"
            style={{ filter: `drop-shadow(0 0 18px ${card.accentSoft})` }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] text-text-dim">
            No. {card.number} · <span style={{ color: card.accent }}>{card.epithet}</span>
          </p>
          <h3 className="font-heading text-gold-foil mt-1 text-xl leading-tight font-bold">{card.name}</h3>
          <p className="mt-2 text-[13px] leading-snug text-text">Ultimate: {card.ult}</p>
          <p className="mt-3 text-[13px] font-semibold text-mint">Tap to read the lore</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" style={backdrop}>
      <p className="px-6 pt-5 text-[13px] text-text-dim">
        No. {card.number} · <span style={{ color: card.accent }}>{card.epithet}</span>
      </p>
      <div className="relative mx-6 mt-3 min-h-0 flex-1">
        <Image
          src={card.image.sm}
          alt={card.name}
          fill
          sizes="(min-width: 1024px) 26vw, 40vw"
          className="object-contain"
          style={{ filter: `drop-shadow(0 18px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 28px ${card.accentSoft})` }}
        />
      </div>
      <div className="glass glass-refract m-4 rounded-2xl px-5 py-4">
        <h3 className="font-heading text-gold-foil text-xl leading-tight font-bold xl:text-2xl">{card.name}</h3>
        <p className="mt-1 text-[13px] text-text">
          <span className="font-semibold text-mint">Ultimate</span> · {card.ult}
        </p>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text">{card.lore}</p>
        <p className="mt-3 text-[13px] font-semibold text-mint">Open the card →</p>
      </div>
    </div>
  );
}
