"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CARDS } from "@/data/cards";

/* ── Deterministic forging: the same name always becomes the same card ── */

function hash(str: string) {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const ADJ = ["Ember", "Runic", "Molten", "Starbound", "Hollow", "Gilded", "Tempered", "Wyrm", "Abyssal", "Verdant", "Iron", "Quantum", "Ashen", "Sunforged"];
const NOUN = ["Rebuke", "Oath", "Cascade", "Bulwark", "Requiem", "Fold", "Brand", "Tithe", "Ascent", "Reckoning", "Lattice", "Vigil", "Hymn", "Sundering"];
const TITLE = ["the Unyielding", "of the Ninth Anvil", "Emberborn", "the Patient", "Star-Sworn", "the Tempered", "of the Deep Vault", "Ash-Walker", "the Bright", "Oathkeeper"];

const LORE: Record<string, (n: string) => string> = {
  goldrax: (n) => `Bound under Goldrax's fury, ${n} fights as though every battle were the last, and never yields the field.`,
  polyphius: (n) => `Struck on Polyphius's sacred anvil, ${n} was tempered to outlast the forge that made them.`,
  quasar: (n) => `Quickened by Quasar's starlight, ${n} grows stronger with every ritual the cards perform.`,
};

export function forge(rawName: string) {
  const name = rawName.trim().replace(/\s+/g, " ").slice(0, 22) || "Wanderer";
  const h = hash(name.toLowerCase());
  const patron = CARDS[h % 3];
  const pick = <T,>(arr: T[], shift: number) => arr[(h >>> shift) % arr.length];
  return {
    name,
    title: pick(TITLE, 5),
    patron,
    number: String(100 + ((h >>> 2) % 900)),
    atk: 1000 + ((h >>> 7) % 40) * 100,
    def: 1000 + ((h >>> 13) % 40) * 100,
    ult: `${pick(ADJ, 17)} ${pick(NOUN, 21)}`,
    lore: LORE[patron.slug](name),
    hue: (h >>> 9) % 360,
  };
}

/* ── Section ── */

export function BindCard() {
  const [input, setInput] = useState("");
  const [strikes, setStrikes] = useState(0);
  const card = useMemo(() => forge(input), [input]);
  const inputId = useId();

  const strike = (e: FormEvent) => {
    e.preventDefault();
    setStrikes((s) => s + 1);
  };

  return (
    <section id="bind" className="relative px-4 pt-28 pb-12 sm:px-8 md:pt-40 md:pb-16" aria-labelledby="bind-title">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(45% 55% at 72% 50%, ${card.patron.accentSoft}, transparent 70%)`, transition: "background 600ms ease" }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 id="bind-title" className="font-display text-mint-glow text-5xl leading-[0.95] font-black tracking-[-0.02em] sm:text-6xl xl:text-7xl">
            Bind your name
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-text">
            Polyphius&apos;s forge binds every living thing to a card. Write a name, strike the anvil, and see the card
            it becomes. The same name always forges the same card.
          </p>

          <form onSubmit={strike} className="mt-10 max-w-md">
            <label htmlFor={inputId} className="font-heading text-lg font-semibold text-gold-pale">
              Name to bind
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id={inputId}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={22}
                placeholder="Wanderer"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-black/30 px-5 py-3 font-heading text-lg text-text placeholder:text-text-dim/60 outline-none transition-colors focus:border-mint/60 focus:bg-black/40"
              />
              <button
                type="submit"
                className="rounded-full bg-gold px-6 py-3 font-heading text-base font-bold text-ink transition-[background-color,transform] duration-150 hover:bg-gold-pale active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
              >
                Strike the anvil
              </button>
            </div>
            <p className="mt-4 text-base text-text" aria-live="polite">
              Patron: <span style={{ color: card.patron.accent }}>{card.patron.name}</span>
            </p>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 3 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-[400px]"
        >
          <ForgedCard card={card} strikes={strikes} />
        </motion.div>
      </div>
    </section>
  );
}

/* ── The card itself, drawn in the game's frame language ── */

type Forged = ReturnType<typeof forge>;

const SPARKS = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1);
  const d = 120 + (i % 4) * 45;
  return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.8, s: 3 + (i % 3) * 2 };
});

function ForgedCard({ card, strikes }: { card: Forged; strikes: number }) {
  const reduce = useReducedMotion();
  const plate = "rounded-[1.2cqw] bg-[#1f2a2c] shadow-[inset_0_0_0_0.5cqw_#c99a45]";

  return (
    <div className="relative" style={{ perspective: 1200 }}>
      <motion.div
        key={strikes}
        className="@container relative aspect-[3000/4236] rounded-[4cqw] p-[3.4cqw]"
        style={{
          background: "linear-gradient(160deg, #f6dc9a 0%, #e9b44c 25%, #b8802a 55%, #e9b44c 80%, #8a5a1c 100%)",
          boxShadow: `0 40px 80px -30px rgba(0,0,0,0.85), 0 0 70px -20px ${card.patron.accent}`,
        }}
        initial={strikes && !reduce ? { rotateY: -180, scale: 0.92 } : false}
        animate={{ rotateY: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 16, mass: 0.9 }}
      >
        <div
          className="relative flex h-full flex-col items-center rounded-[2.4cqw] px-[5cqw] pt-[5cqw] pb-[8.5cqw]"
          style={{
            background: `radial-gradient(80% 50% at 50% 30%, ${card.patron.accentSoft}, transparent 70%), linear-gradient(180deg, #2a2f38 0%, #1b1f26 100%)`,
            transition: "background 500ms ease",
          }}
        >
          {/* Corner gems */}
          {["top-[2cqw] left-[2cqw]", "top-[2cqw] right-[2cqw]", "bottom-[2cqw] left-[2cqw]", "bottom-[2cqw] right-[2cqw]"].map((pos) => (
            <span
              key={pos}
              aria-hidden
              className={`absolute ${pos} size-[3.2cqw] rotate-45 rounded-[0.6cqw] bg-mint shadow-[0_0_2cqw_rgba(63,230,212,0.8),inset_0_0_0_0.5cqw_#8a5a1c]`}
            />
          ))}

          {/* Name plate */}
          <div className={`${plate} w-[82%] px-[3cqw] py-[1.8cqw] text-center`}>
            <p className="font-heading text-gold-foil truncate text-[6.2cqw] leading-tight font-black uppercase">{card.name}</p>
          </div>
          <p className="font-heading mt-[1.2cqw] text-[3.4cqw] text-gold-pale/85">{card.title}</p>

          {/* Art window */}
          <div
            className="relative mt-[2.4cqw] aspect-[1.18] w-full overflow-hidden rounded-[1.6cqw] shadow-[inset_0_0_0_0.6cqw_#c99a45]"
            style={{ background: "radial-gradient(60% 60% at 50% 55%, #e8c987 0%, #9b6a2a 70%, #5a3a14 100%)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero/crystal.webp"
              alt=""
              className="absolute max-w-none"
              style={{
                width: "484%",
                left: "-197%",
                top: "-85%",
                filter: `hue-rotate(${card.hue}deg) saturate(1.2) drop-shadow(0 0 3cqw ${card.patron.accent})`,
                transition: "filter 500ms ease",
              }}
            />
            <motion.div
              key={`flash-${strikes}`}
              aria-hidden
              className="absolute inset-0 bg-white mix-blend-overlay"
              initial={{ opacity: strikes && !reduce ? 0.9 : 0 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* Stats */}
          <div className="mt-[3cqw] grid w-full grid-cols-2 gap-[3cqw]">
            {(["atk", "def"] as const).map((k) => (
              <div key={k} className={`${plate} py-[1.6cqw] text-center`}>
                <p className="font-heading text-[5cqw] leading-none font-bold text-gold-pale tabular-nums">
                  {k.toUpperCase()} {card[k]}
                </p>
              </div>
            ))}
          </div>
          <div className={`${plate} mt-[2.4cqw] w-full py-[1.6cqw] text-center`}>
            <p className="font-heading text-[4.2cqw] leading-none text-gold-pale">ULT : {card.ult.toUpperCase()}</p>
          </div>
          <div className={`${plate} mt-[2.4cqw] flex w-full flex-1 items-center px-[4cqw] py-[2cqw]`}>
            <p className="font-heading text-center text-[3.5cqw] leading-snug text-gold-pale">{card.lore}</p>
          </div>
          <p className="font-heading absolute bottom-[2cqw] left-[7cqw] text-[4.6cqw] text-gold-pale tabular-nums">{card.number}</p>
        </div>
      </motion.div>

      {/* Sparks from the strike */}
      <AnimatePresence>
        {strikes > 0 && !reduce && (
          <div key={`sparks-${strikes}`} aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {SPARKS.map((s, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{
                  width: s.s,
                  height: s.s,
                  background: i % 3 ? "#ffd29a" : "#7ff7ea",
                  boxShadow: `0 0 10px 2px ${i % 3 ? "rgba(255,122,47,0.8)" : "rgba(63,230,212,0.8)"}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: s.x, y: s.y + 40, opacity: 0, scale: 0.3 }}
                transition={{ duration: 0.9 + (i % 4) * 0.12, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
