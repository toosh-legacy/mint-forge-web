"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  easeIn,
  easeInOut,
  easeOut,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { CARDS } from "@/data/cards";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { ART_STAGE } from "@/lib/stage";
import { GoldSheet } from "./GoldSheet";
import { ScrollSplitCard } from "./ui/scroll-split-card";
import { CardBack } from "./CardBack";
import { CardModal } from "./CardModal";

/**
 * One tall scroll region, one sticky stage:
 *   0.00 – 0.38  Hero: title rises, anvil drops, the hoard lifts into a molten gold sheet.
 *   0.38 – 1.00  The sheet splits into three panels that flip to reveal the gods.
 */
const HANDOFF = 0.38;

const layer = "pointer-events-none absolute inset-0 h-full w-full object-cover select-none";

export function ForgeSequence() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const desktop = useMediaQuery("(min-width: 768px)", true);
  const orientation = desktop ? "vertical" : "horizontal";
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);

  const split = useTransform(p, [HANDOFF, 1], [0, 1]);
  const heroDisplay = useTransform(p, (v) => (v < HANDOFF ? "block" : "none"));
  const splitDisplay = useTransform(p, (v) => (v >= HANDOFF ? "block" : "none"));

  return (
    <section ref={ref} id="forge" className="relative h-[640vh]" aria-label="The Forge">
      {/* Anchor for the nav: lands right as the panels begin to separate */}
      <div id="gods" className="absolute left-0 w-px" style={{ top: `${HANDOFF * 100 + 6}%` }} />

      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ display: heroDisplay }}>
          <Hero p={p} orientation={orientation} />
        </motion.div>

        <motion.div className="absolute inset-0" style={{ display: splitDisplay }}>
          <ScrollSplitCard
            progress={split}
            orientation={orientation}
            front={(i) => <GoldSheet textReveal={1} seams={1} orientation={orientation} decorative={i !== 1} />}
            cards={CARDS.map((c) => ({ title: c.name, description: c.lore, bgColor: "#141718", textColor: "#ece6da" }))}
            renderBack={(i) => <CardBack card={CARDS[i]} compact={!desktop} />}
            onSelect={setOpen}
            overlay={(q) => <SplitHeading q={q} />}
          />
        </motion.div>
      </div>

      <CardModal card={open === null ? null : CARDS[open]} onClose={close} />
    </section>
  );
}

function Hero({ p, orientation }: { p: MotionValue<number>; orientation: "vertical" | "horizontal" }) {
  // Title & crystal
  const titleY = useTransform(p, [0, 0.12], ["0vh", "-30vh"]);
  const titleOpacity = useTransform(p, [0, 0.1], [1, 0]);
  const titleScale = useTransform(p, [0, 0.12], [1, 0.9]);
  const crystalY = useTransform(p, [0, 0.16], ["0vh", "-12vh"]);
  const crystalScale = useTransform(p, [0, 0.16], [1, 1.3]);
  const crystalOpacity = useTransform(p, [0.2, 0.27], [1, 0]);
  const crystalGlow = useTransform(p, [0, 0.12, 0.27], [0.35, 1, 0]);

  // Anvil: tiny anticipation lift, then accelerates down like it's been dropped.
  const anvilY = useTransform(p, [0, 0.025, 0.16], ["0vh", "-2.5vh", "118vh"], { ease: [easeOut, easeIn] });
  const anvilRotate = useTransform(p, [0.025, 0.16], [0, 6], { ease: easeIn });
  const impact = useTransform(p, [0.13, 0.155, 0.22], [0, 0.85, 0]);

  // The hoard lifts and closes in, pulling a molten sheet up behind it.
  // `dist` = how far the sheet travels: from the bottom of the hoard (in the art stage) to the top of the viewport.
  const stageRef = useRef<HTMLDivElement>(null);
  const dist = useMotionValue(0);
  const vh = useMotionValue(1000);
  useEffect(() => {
    const measure = () => {
      const r = stageRef.current?.getBoundingClientRect();
      if (r) dist.set(r.top + r.height * 0.97);
      vh.set(window.innerHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [dist, vh]);
  const rise = useTransform(p, [0.12, 0.31], [0, 1], { ease: easeInOut });
  const goldY = useTransform([rise, dist], ([r, d]: number[]) => -r * d);
  // The sheet floods up from the bottom edge, so nothing gold shows at rest.
  const sheetY = useTransform([rise, vh], ([r, h]: number[]) => (1 - r) * h);
  const pilesOpacity = useTransform(p, [0.27, 0.31], [1, 0]);
  const goldScale = useTransform(p, [0.12, 0.31], [1, 1.12]);
  const leftX = useTransform(p, [0.12, 0.3], ["0vw", "7vw"]);
  const rightX = useTransform(p, [0.12, 0.3], ["0vw", "-7vw"]);
  const reduce = useReducedMotion();
  const textRevealScroll = useTransform(p, [0.29, 0.33], [0, 1]);
  const textReveal = reduce ? 1 : textRevealScroll;
  const seams = useTransform(p, [0.33, HANDOFF], [0, 1], { ease: easeOut });

  // Scroll cue + first-screen copy
  const cueOpacity = useTransform(p, [0, 0.03], [1, 0]);
  const introOpacity = useTransform(p, [0, 0.05], [1, 0]);
  const introY = useTransform(p, [0, 0.05], [0, -24]);

  return (
    <div className="absolute inset-0">
      {/* eslint-disable @next/next/no-img-element -- pre-optimised layered art; positions must match exactly */}
      <img src="/hero/plate.webp" alt="" className={layer} />

      {/* Art stage: full-bleed on landscape; on portrait a wider-than-screen 16:9 band so the whole title stays visible. */}
      <div
        ref={stageRef}
        className={ART_STAGE}
      >

      <motion.h1 className="absolute inset-0 m-0" style={{ y: titleY, opacity: titleOpacity, scale: titleScale }}>
        <img
          src="/hero/title.webp"
          alt="MintForge"
          className={layer}
          style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.55))" }}
        />
      </motion.h1>

      <motion.div className="absolute inset-0" style={{ y: crystalY, opacity: crystalOpacity }}>
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-[43%] size-[34vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            opacity: crystalGlow,
            background: "radial-gradient(circle, rgba(127,247,234,0.55) 0%, rgba(63,230,212,0.18) 40%, transparent 70%)",
          }}
        />
        <motion.img
          src="/hero/crystal.webp"
          alt=""
          className={layer}
          style={{ scale: crystalScale, transformOrigin: "51% 43%" }}
        />
      </motion.div>

      <motion.img
        src="/hero/anvil.webp"
        alt=""
        className={layer}
        style={{ y: anvilY, rotate: anvilRotate, transformOrigin: "50% 75%" }}
      />

      <motion.div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[45vh]"
        style={{
          opacity: impact,
          background: "radial-gradient(60% 80% at 50% 100%, rgba(255,160,80,0.75), rgba(255,122,47,0.25) 40%, transparent 70%)",
        }}
      />

      {/* The hoard lifts... */}
      <motion.div className="absolute inset-0" style={{ y: goldY }}>
        <motion.div className="absolute inset-0" style={{ scale: goldScale, opacity: pilesOpacity, transformOrigin: "50% 100%" }}>
          <motion.img src="/hero/gold-left.webp" alt="" className={layer} style={{ x: leftX }} />
          <motion.img src="/hero/gold-right.webp" alt="" className={layer} style={{ x: rightX }} />
        </motion.div>
      </motion.div>
      </div>

      {/* ...pulling a viewport-sized molten sheet up behind it */}
      <motion.div className="absolute inset-0" style={{ y: sheetY }}>
        <div
          className="absolute inset-x-0 -top-[8vh] h-[8.5vh]"
          style={{ background: "linear-gradient(180deg, transparent, rgba(233,180,76,0.85) 70%, #e9b44c)" }}
        />
        <GoldSheet textReveal={textReveal} seams={seams} orientation={orientation} />
      </motion.div>
      {/* eslint-enable @next/next/no-img-element */}

      {/* First-screen copy: what this is, and the one thing to do */}
      <motion.div
        style={{ opacity: introOpacity, y: introY }}
        className="absolute z-10 portrait:inset-x-0 portrait:bottom-[7vh] portrait:px-6 portrait:text-center landscape:top-1/2 landscape:left-[max(24px,5vw)] landscape:max-w-[19rem] landscape:-translate-y-1/2"
      >
        <p className="text-lg leading-snug text-text lg:text-xl">
          A card game of living legends, bound to cards on the first anvil.
        </p>
        <div className="mt-6 flex items-center gap-5 portrait:justify-center">
          <a
            href="#gods"
            className="rounded-full bg-gold px-6 py-3 font-heading text-base font-bold text-ink transition-[background-color,transform] duration-150 hover:bg-gold-pale active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
          >
            Meet the three gods
          </a>
          <a href="#bind" className="text-base text-mint underline-offset-4 transition-colors hover:text-mint-glow hover:underline">
            Forge your card
          </a>
        </div>
      </motion.div>

      <motion.div
        style={{ opacity: cueOpacity }}
        className="absolute flex flex-col items-center gap-3 text-text/80 portrait:hidden landscape:top-1/2 landscape:right-[max(24px,5vw)] landscape:-translate-y-1/2"
      >
        <span className="font-heading text-sm [writing-mode:vertical-rl]">Scroll to strike the anvil</span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_1.8s_var(--ease-in-out-quart)_infinite] bg-mint" />
        </span>
        <style>{`@keyframes cue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
      </motion.div>
    </div>
  );
}

function SplitHeading({ q }: { q: MotionValue<number> }) {
  const opacity = useTransform(q, [0.08, 0.2], [0, 1]);
  const y = useTransform(q, [0.08, 0.2], [-16, 0]);
  const hint = useTransform(q, [0.68, 0.78], [0, 1]);
  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 top-[8vh] z-10 mx-auto flex w-fit max-w-full flex-col items-center px-4 text-center md:top-[11vh]"
    >
      <h2 className="font-heading text-xl font-bold text-gold-pale md:text-3xl">The gods of the forge</h2>
      <motion.p style={{ opacity: hint }} className="mt-1 text-[13px] text-text md:text-sm">
        Select a god to read their lore
      </motion.p>
    </motion.div>
  );
}
