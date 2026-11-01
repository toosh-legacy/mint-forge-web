"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { ART_STAGE } from "@/lib/stage";

// Everything the first screens need; the loader holds until these are decoded.
const PRELOAD = [
  "/hero/full.webp",
  "/hero/plate.webp",
  "/hero/title.webp",
  "/hero/crystal.webp",
  "/hero/anvil.webp",
  "/hero/gold-left.webp",
  "/hero/gold-right.webp",
  "/cards/goldrax-800.webp",
  "/cards/polyphius-800.webp",
  "/cards/quasar-800.webp",
];

// Brush strokes on a 1920×1080 canvas (matches the key art). Wide, overlapping, alternating direction.
const STROKES: { d: string; w: number }[] = [
  { d: "M -120 170 C 380 70, 900 250, 2040 120", w: 300 },
  { d: "M 990 -80 C 930 330, 1060 640, 960 1160", w: 330 },
  { d: "M 2040 420 C 1500 330, 640 520, -120 380", w: 300 },
  { d: "M -120 640 C 520 540, 1280 760, 2040 600", w: 300 },
  { d: "M 2040 880 C 1320 780, 640 980, -120 850", w: 320 },
  { d: "M -120 1090 C 640 990, 1240 1150, 2040 1030", w: 300 },
  { d: "M -60 -40 C 600 380, 1300 700, 1980 1120", w: 260 },
  { d: "M 1980 -40 C 1300 380, 620 700, -60 1120", w: 260 },
];

const INK_IN = 0.55; // line art arrives
const STROKE_START = 0.75;
const STROKE_STAGGER = 0.22;
const STROKE_DUR = 0.62;
const PAINT_END = STROKE_START + STROKE_STAGGER * (STROKES.length - 1) + STROKE_DUR; // ≈ 2.9s

export function Loader({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const [loaded, setLoaded] = useState(0);
  const [painted, setPainted] = useState(false);

  // Preload + decode hero assets.
  useEffect(() => {
    let cancelled = false;
    PRELOAD.forEach((src) => {
      const img = new Image();
      img.src = src;
      img
        .decode()
        .catch(() => {})
        .finally(() => !cancelled && setLoaded((n) => n + 1));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Paint timeline.
  useEffect(() => {
    const t = setTimeout(() => setPainted(true), (reduce ? 0.4 : PAINT_END + 0.35) * 1000);
    return () => clearTimeout(t);
  }, [reduce]);

  const ready = loaded >= PRELOAD.length;
  const gone = ready && (painted || !!reduce);

  // Hold scroll while the loader is up.
  useEffect(() => {
    if (!lenis) return;
    if (gone) lenis.start();
    else {
      lenis.stop();
      window.scrollTo(0, 0);
    }
  }, [lenis, gone]);

  const pct = Math.round((loaded / PRELOAD.length) * 100);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!gone && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[70] overflow-hidden bg-parchment"
          exit={{ opacity: 0, transition: { duration: reduce ? 0.15 : 0.7, ease: [0.76, 0, 0.24, 1] } }}
          aria-busy="true"
          aria-label="Loading MintForge"
          role="status"
        >
          {/* On portrait the art sits on a band; the forge backdrop fades in around it as the paint lands. */}
          { }
          <motion.img
            src="/hero/plate.webp"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : PAINT_END - 0.6, duration: 0.8 }}
          />
          <div className={`${ART_STAGE} portrait:[mask-image:linear-gradient(transparent,#000_14%,#000_90%,transparent)]`}>
          <motion.svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            initial={{ scale: 1.04 }}
            animate={{ scale: 1 }}
            exit={{ scale: 1.015 }}
            transition={{ duration: PAINT_END, ease: [0.16, 1, 0.3, 1] }}
          >
            <defs>
              {/* Rough, bristly edges for the brush mask */}
              <filter id="brush-edge" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.035 0.09" numOctaves="3" seed="11" />
                <feDisplacementMap in="SourceGraphic" scale="70" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <mask id="paint-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
                <rect width="1920" height="1080" fill="black" />
                <g filter="url(#brush-edge)">
                  {STROKES.map((s, i) => (
                    <motion.path
                      key={i}
                      d={s.d}
                      fill="none"
                      stroke="white"
                      strokeWidth={s.w}
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : {
                              delay: STROKE_START + i * STROKE_STAGGER,
                              duration: STROKE_DUR,
                              ease: [0.65, 0, 0.35, 1],
                            }
                      }
                    />
                  ))}
                </g>
                {/* Seal any gaps once the strokes are down */}
                <motion.rect
                  width="1920"
                  height="1080"
                  fill="white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduce ? 0 : PAINT_END - 0.2, duration: 0.45 }}
                />
              </mask>
              <radialGradient id="crystal-glow">
                <stop offset="0" stopColor="#7ff7ea" stopOpacity="0.9" />
                <stop offset="0.45" stopColor="#3fe6d4" stopOpacity="0.3" />
                <stop offset="1" stopColor="#3fe6d4" stopOpacity="0" />
              </radialGradient>
            </defs>

            <motion.image
              href="/loader/lineart.webp"
              width="1920"
              height="1080"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduce ? 0.2 : INK_IN, ease: "easeOut" }}
            />
            <image href="/hero/full.webp" width="1920" height="1080" mask="url(#paint-mask)" />

            {/* Crystal awakens as the colour lands */}
            <motion.circle
              cx="980"
              cy="462"
              r="190"
              fill="url(#crystal-glow)"
              style={{ mixBlendMode: "screen" }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0.55], scale: [0.6, 1.15, 1] }}
              transition={{ delay: reduce ? 0 : PAINT_END - 0.5, duration: 1.1, ease: "easeOut" }}
            />
          </motion.svg>
          </div>

          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 motion-reduce:hidden sm:bottom-10">
            <motion.p
              className="font-heading text-sm font-semibold"
              initial={{ color: "#2a2420" }}
              animate={{ color: "#f6dc9a" }}
              transition={{ delay: reduce ? 0 : STROKE_START + 1, duration: 0.8 }}
            >
              Forging the first cards · {pct}%
            </motion.p>
            <div className="h-px w-40 overflow-hidden bg-black/15">
              <motion.div
                className="h-full origin-left bg-gold"
                animate={{ scaleX: loaded / PRELOAD.length }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>

          <button
            onClick={() => setPainted(true)}
            className="absolute top-5 right-5 rounded-full px-4 py-2 motion-reduce:hidden text-sm text-white/80 mix-blend-difference transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white"
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
