"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { GAME, STORES } from "@/config/site";

/** Store picker for the game download. Sits above the loader (z-70) so it can open during the intro. */
export function DownloadModal({ open, onClose, restoreScroll }: { open: boolean; onClose: () => void; restoreScroll: boolean }) {
  const lenis = useLenis();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      // While the loader is still up it owns the scroll lock; don't release it early.
      if (restoreScroll) lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis, onClose, restoreScroll]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="download"
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="download-title"
          data-lenis-prevent
        >
          <div
            className="absolute inset-0 backdrop-blur-md"
            onClick={onClose}
            style={{ background: "radial-gradient(70% 60% at 50% 40%, rgba(63,230,212,0.14), rgba(10,12,13,0.88))" }}
          />
          <motion.div
            className="glass glass-refract relative my-auto w-full max-w-2xl rounded-3xl p-6 sm:p-9"
            initial={reduce ? { opacity: 0 } : { y: -24, scale: 0.97 }}
            animate={reduce ? { opacity: 1 } : { y: 0, scale: 1, transition: { type: "spring", duration: 0.55, bounce: 0.18 } }}
            exit={reduce ? { opacity: 0 } : { y: -12, scale: 0.98 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 grid size-10 place-items-center rounded-full text-text-dim transition-[color,background-color,transform] duration-150 hover:bg-white/10 hover:text-white active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-mint"
              aria-label="Close"
              autoFocus
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <p className="text-sm text-mint">Download the game</p>
            <h2 id="download-title" className="font-display text-gold-foil mt-1 pr-10 text-3xl leading-tight font-black sm:text-4xl">
              {GAME.name}
            </h2>
            <p className="mt-2 text-base text-text/80">{GAME.tagline}</p>

            <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {STORES.map((s, i) => {
                const live = s.href !== "";
                const body = (
                  <>
                    <span
                      aria-hidden
                      className="font-heading grid size-11 shrink-0 place-items-center rounded-xl text-[13px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                      style={{ background: s.tint }}
                    >
                      {s.mark}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-heading block truncate text-base font-semibold text-text">{s.name}</span>
                      <span className="block truncate text-[13px] text-text-dim">
                        {live ? s.platforms : <><span className="text-gold-pale">Coming soon</span> · {s.platforms}</>}
                      </span>
                    </span>
                    {live && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="shrink-0 text-mint transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <path d="M7 17L17 7M8 7h9v9" />
                      </svg>
                    )}
                  </>
                );
                return (
                  <motion.li
                    key={s.name}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.03, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {live ? (
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 transition-[background-color,transform] duration-150 hover:bg-white/[0.09] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-mint"
                      >
                        {body}
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 rounded-2xl bg-white/[0.02] p-3 opacity-70" aria-disabled="true">
                        {body}
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The download trigger: a gold pill with a down-arrow that tucks under the cursor on hover. */
export function DownloadButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-haspopup="dialog"
      className={`group flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 font-heading text-sm font-bold text-ink shadow-[0_10px_30px_-10px_rgba(233,180,76,0.7)] transition-[background-color,transform] duration-150 hover:bg-gold-pale active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden className="transition-transform duration-200 group-hover:translate-y-0.5">
        <path d="M12 4v12M6 11l6 6 6-6M5 20h14" />
      </svg>
      Download the game
    </button>
  );
}
