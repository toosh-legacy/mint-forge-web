"use client";

import { motion } from "motion/react";
import { DEVELOPER } from "@/config/site";

// Deterministic ember field (no Math.random → no hydration mismatch).
const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i * 0.73) % 9}s`,
  dur: `${8 + ((i * 1.7) % 6)}s`,
  drift: `${((i * 23) % 60) - 30}px`,
  size: 2 + (i % 3),
}));

const ICONS: Record<string, React.ReactNode> = {
  github: <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />,
  x: <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43z" />,
  discord: <path d="M20.3 4.4A19.7 19.7 0 0 0 15.4 3l-.6 1.3a18.3 18.3 0 0 0-5.6 0L8.6 3a19.6 19.6 0 0 0-4.9 1.4C.6 9-.2 13.5.3 18a19.8 19.8 0 0 0 6 3l1.3-2a12.8 12.8 0 0 1-2-1l.5-.4a14.1 14.1 0 0 0 12 0l.5.4c-.6.4-1.3.7-2 1l1.3 2a19.7 19.7 0 0 0 6-3c.5-5.2-.8-9.7-3.6-13.6zM8.7 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4zm6.6 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4z" />,
  instagram: <path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM21.9 8.1c-.1-1.6-.4-3-1.6-4.2S17.6 2.3 16 2.2C14.3 2.1 9.7 2.1 8 2.2c-1.6.1-3 .4-4.2 1.6S2.3 6.4 2.2 8c-.1 1.7-.1 6.3 0 8 .1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.7.1 6.3.1 8 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.7.1-6.3 0-7.9zM19.8 18a3 3 0 0 1-1.7 1.7c-1.2.5-4 .4-5.3.4s-4.1.1-5.3-.4A3 3 0 0 1 5.9 18c-.5-1.2-.4-4-.4-5.3s-.1-4.1.4-5.3A3 3 0 0 1 7.6 5.7c1.2-.5 4-.4 5.3-.4s4.1-.1 5.3.4a3 3 0 0 1 1.7 1.7c.5 1.2.4 4 .4 5.3s.1 4.1-.5 5.3z" />,
};

export function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden px-4 pt-16 pb-8 sm:px-8 md:pt-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 bottom-0 h-[70%]"
          style={{ background: "radial-gradient(60% 70% at 50% 100%, rgba(255,122,47,0.16), rgba(110,53,24,0.08) 50%, transparent 75%)" }}
        />
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="ember"
            style={{
              left: e.left,
              width: e.size,
              height: e.size,
              ["--delay" as string]: e.delay,
              ["--dur" as string]: e.dur,
              ["--drift" as string]: e.drift,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="glass glass-refract relative mx-auto max-w-4xl rounded-[2rem] p-8 sm:p-12"
      >
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <h2 className="font-display text-mint-glow text-4xl font-black sm:text-5xl">{DEVELOPER.name}</h2>
            <p className="mt-2 text-base text-text">{DEVELOPER.role}</p>
            <p className="mt-4 max-w-sm text-text">{DEVELOPER.blurb}</p>
            <a
              href={`mailto:${DEVELOPER.email}`}
              className="group mt-6 inline-flex items-center gap-3 rounded-full border border-mint/30 bg-mint/5 px-5 py-3 font-heading text-sm tracking-wide text-mint transition-colors duration-200 hover:border-mint/60 hover:bg-mint/10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              {DEVELOPER.email}
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </a>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {DEVELOPER.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-text/85 transition-[background-color,border-color,box-shadow,transform] duration-200 active:scale-[0.98] hover:border-mint/40 hover:bg-mint/[0.06] hover:shadow-[0_0_24px_-6px_rgba(63,230,212,0.6)]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-text-dim transition-colors group-hover:text-mint">
                    {ICONS[l.icon]}
                  </svg>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* The name returns, full width: the original forged lettering as the close. */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-5%" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto mt-20 max-w-[1600px] overflow-hidden md:mt-28"
        style={{ aspectRatio: "1500 / 215" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/title.webp"
          alt="MintForge"
          className="absolute max-w-none select-none"
          style={{ width: "133.333%", left: "-18%", top: "-53.5%", filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.5))" }}
        />
      </motion.div>
      <div className="relative mx-auto mt-8 flex max-w-[1600px] flex-col items-center justify-between gap-2 text-sm text-text-dim sm:flex-row">
        <span>© 2026 MintForge. Every card forged by hand.</span>
        <a href="#forge" className="transition-colors hover:text-mint">Back to the anvil ↑</a>
      </div>
    </footer>
  );
}
