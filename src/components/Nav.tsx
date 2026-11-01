"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";

const LINKS = [
  { href: "#gods", label: "The Gods" },
  { href: "#bind", label: "Forge a card" },
  { href: "#merch", label: "Merch" },
  { href: "#contact", label: "Contact" },
];

export function Nav({ show }: { show: boolean }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  // Hide on scroll down, reveal on scroll up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 160);
  });

  return (
    <motion.header
      className="fixed inset-x-0 top-3 z-40 flex justify-center px-4 sm:top-5"
      initial={{ y: -90, opacity: 0 }}
      animate={show ? { y: hidden ? -90 : 0, opacity: hidden ? 0 : 1 } : { y: -90, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <nav className="glass glass-refract flex items-center gap-1 rounded-full py-1.5 pr-1.5 pl-5 sm:gap-2">
        <a href="#forge" className="font-display text-mint-glow mr-2 text-base font-bold tracking-wide sm:mr-4 sm:text-lg">
          MintForge
        </a>
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="hidden rounded-full px-3.5 py-2 text-sm text-text/85 transition-colors duration-200 hover:bg-white/8 hover:text-white md:block"
          >
            {l.label}
          </a>
        ))}
        <a
          href="#join"
          className="px-4 py-2 text-sm rounded-full bg-gold font-heading font-bold text-ink transition-[background-color,transform] duration-150 hover:bg-gold-pale active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
        >
          Join the list
        </a>
      </nav>
    </motion.header>
  );
}
