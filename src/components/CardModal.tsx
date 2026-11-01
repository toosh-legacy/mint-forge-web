"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useLenis } from "lenis/react";
import type { ForgeCard } from "@/data/cards";

export function CardModal({ card, onClose }: { card: ForgeCard | null; onClose: () => void }) {
  const lenis = useLenis();

  useEffect(() => {
    if (!card) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [card, lenis, onClose]);

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          key={card.slug}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          role="dialog"
          aria-modal="true"
          aria-label={card.name}
          data-lenis-prevent
        >
          <div
            className="absolute inset-0 bg-ink/70 backdrop-blur-md"
            onClick={onClose}
            style={{ background: `radial-gradient(60% 60% at 35% 50%, ${card.accentSoft}, rgba(10,12,13,0.85))` }}
          />
          <motion.div
            className="relative grid w-full max-w-5xl items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
            initial={{ y: 40, scale: 0.96 }}
            animate={{ y: 0, scale: 1, transition: { type: "spring", duration: 0.6, bounce: 0.2 } }}
            exit={{ y: 20, scale: 0.98 }}
          >
            <TiltCard card={card} />
            <LorePanel card={card} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TiltCard({ card }: { card: ForgeCard }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const rotateY = useSpring(useTransform(px, [0, 1], [-14, 14]), spring);
  const rotateX = useSpring(useTransform(py, [0, 1], [12, -12]), spring);
  const mx = useTransform(px, (v) => `${v * 100}%`);
  const my = useTransform(py, (v) => `${v * 100}%`);
  const angle = useTransform(px, (v) => `${v * 220}deg`);
  const glareX = useTransform(px, [0, 1], ["-30%", "30%"]);

  return (
    <div style={{ perspective: 1200 }} className="mx-auto w-full max-w-[380px]">
      <motion.div
        ref={ref}
        className="relative aspect-[3000/4236] overflow-hidden rounded-[18px]"
        style={{
          rotateX: reduce ? 0 : rotateX,
          rotateY: reduce ? 0 : rotateY,
          transformStyle: "preserve-3d",
          boxShadow: `0 40px 80px -30px rgba(0,0,0,0.8), 0 0 60px -10px ${card.accentSoft}`,
        }}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
        }}
      >
        <Image src={card.image.lg} alt={card.name} fill sizes="380px" className="object-cover" preload />
        {!reduce && (
          <>
            <motion.div
              aria-hidden
              className="foil pointer-events-none absolute inset-0 opacity-30"
              style={{ ["--mx" as string]: mx, ["--my" as string]: my, ["--foil-angle" as string]: angle }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-1/2"
              style={{
                x: glareX,
                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.28) 50%, transparent 60%)",
              }}
            />
          </>
        )}
      </motion.div>
      <p className="mt-3 text-center text-[13px] text-text-dim">Move your cursor over the card</p>
    </div>
  );
}

function LorePanel({ card, onClose }: { card: ForgeCard; onClose: () => void }) {
  const words = card.lore.split(" ");
  return (
    <div className="glass glass-refract relative rounded-3xl p-7 sm:p-9">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 grid size-10 place-items-center rounded-full text-text-dim transition-[color,background-color,transform] duration-150 hover:bg-white/10 active:scale-[0.94] hover:text-white focus-visible:outline-2 focus-visible:outline-mint"
        aria-label="Close"
        autoFocus
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <p className="text-sm" style={{ color: card.accent }}>
        No. {card.number} · {card.epithet}
      </p>
      <h3 className="font-display text-gold-foil mt-2 pr-10 text-3xl leading-tight font-black sm:text-4xl">{card.name}</h3>

      <dl className="mt-6 flex gap-10">
        {(["atk", "def"] as const).map((k, i) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <dt className="text-sm text-text-dim">{k === "atk" ? "Attack" : "Defence"}</dt>
            <dd className="font-heading text-4xl font-bold text-gold-pale tabular-nums">{card[k].toLocaleString()}</dd>
          </motion.div>
        ))}
      </dl>

      <div className="mt-6 rounded-2xl bg-mint/[0.07] px-4 py-3">
        <p className="text-sm text-mint">Ultimate</p>
        <p className="font-heading mt-0.5 text-xl font-semibold text-text">{card.ult}</p>
      </div>

      <p className="mt-6 text-base leading-relaxed text-text/90">
        {words.map((w, i) => (
          <span key={i}>
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.35 + i * 0.025, duration: 0.4 }}
            >
              {w}
            </motion.span>{" "}
          </span>
        ))}
      </p>
    </div>
  );
}
