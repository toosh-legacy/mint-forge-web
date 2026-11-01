"use client";

import { motion, type MotionValue } from "motion/react";

type Props = {
  /** 0→1 reveal of the engraved headline. Static (fully shown) when omitted. */
  textReveal?: MotionValue<number> | number;
  /** 0→1 growth of the two glowing seams where the sheet will split. */
  seams?: MotionValue<number> | number;
  orientation?: "vertical" | "horizontal";
  /** Copies used purely as split-panel imagery are hidden from assistive tech and carry no heading. */
  decorative?: boolean;
};

/**
 * The molten-gold sheet the hoard lifts into. Rendered identically at the end of the
 * hero and as the front face of the split card, so the hand-off is invisible.
 */
export function GoldSheet({ textReveal = 1, seams = 0, orientation = "vertical", decorative = false }: Props) {
  const Title = decorative ? "p" : "h2";
  const vertical = orientation === "vertical";
  return (
    <div className="gold-sheet absolute inset-0 overflow-hidden" aria-hidden={decorative || undefined}>
      <div className="gold-sheet-texture absolute inset-0" />
      {/* Slow molten shimmer */}
      <div
        className="absolute inset-y-0 -left-full w-[300%] opacity-60 mix-blend-soft-light motion-reduce:hidden"
        style={{
          background: "linear-gradient(115deg, transparent 40%, rgba(255,250,225,0.9) 48%, transparent 56%)",
          animation: "gold-shimmer 7s var(--ease-in-out-quart) infinite",
          willChange: "transform",
        }}
      />
      <motion.div
        style={{ opacity: textReveal }}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <Title className="engraved font-display text-5xl leading-[0.95] font-black tracking-[-0.02em] sm:text-7xl lg:text-[8.5vw]">
          The First Forged
        </Title>
        <p className="engraved font-heading mt-6 max-w-md text-lg font-semibold sm:text-xl">
          Three gods. One anvil. Every card began here.
        </p>
      </motion.div>
      {[1, 2].map((n) => (
        <motion.span
          key={n}
          aria-hidden
          className="absolute"
          style={
            vertical
              ? {
                  left: `${(n / 3) * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  marginLeft: -1,
                  scaleY: seams,
                  background: "linear-gradient(180deg, transparent, #7ff7ea 20%, #fff 50%, #7ff7ea 80%, transparent)",
                  boxShadow: "0 0 18px 4px rgba(63,230,212,0.7)",
                }
              : {
                  top: `${(n / 3) * 100}%`,
                  left: 0,
                  right: 0,
                  height: 2,
                  marginTop: -1,
                  scaleX: seams,
                  background: "linear-gradient(90deg, transparent, #7ff7ea 20%, #fff 50%, #7ff7ea 80%, transparent)",
                  boxShadow: "0 0 18px 4px rgba(63,230,212,0.7)",
                }
          }
        />
      ))}
      <style>{`@keyframes gold-shimmer{0%{transform:translate3d(-30%,0,0)}100%{transform:translate3d(30%,0,0)}}`}</style>
    </div>
  );
}
