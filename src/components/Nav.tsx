"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { Crown, Download, Hammer, House, Mail, ShoppingBag, Sparkles } from "lucide-react";
import { Dock, DockDivider, DockItem } from "./ui/dock";

const LINKS = [
  { id: "forge", label: "Home", icon: <House /> },
  { id: "gods", label: "The Gods", icon: <Crown /> },
  { id: "bind", label: "Forge a card", icon: <Hammer /> },
  { id: "merch", label: "Merch", icon: <ShoppingBag /> },
  { id: "join", label: "Join the list", icon: <Sparkles /> },
  { id: "contact", label: "Contact", icon: <Mail /> },
] as const;

type Id = (typeof LINKS)[number]["id"];

/** Scroll position where the title has fully faded out of the forge hero (see ForgeSequence: titleOpacity 0 at p=0.1). */
function titleGoneAt() {
  const forge = document.getElementById("forge");
  if (!forge) return 0;
  return forge.offsetTop + 0.1 * (forge.offsetHeight - window.innerHeight);
}

function top(id: Id) {
  const el = document.getElementById(id);
  return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
}

/**
 * Left-hand vertical dock. Stays out of the way until the MintForge Eternal title has
 * scrolled off, then slides in from the left edge.
 */
export function Nav({ show, onDownload }: { show: boolean; onDownload: () => void }) {
  const lenis = useLenis();
  const [pastTitle, setPastTitle] = useState(false);
  const [active, setActive] = useState<Id>("forge");

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      setPastTitle(y > titleGoneAt() - 1);
      // Active = last section whose top is above 40% of the viewport.
      const probe = y + window.innerHeight * 0.4;
      let current: Id = "forge";
      for (const l of LINKS) if (top(l.id) <= probe) current = l.id;
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const go = (id: Id) => (e: React.MouseEvent) => {
    if (!lenis) return; // fall back to the native anchor jump
    e.preventDefault();
    if (id === "forge") lenis.scrollTo(0);
    else lenis.scrollTo(`#${id}`, { offset: id === "join" ? -96 : 0 });
    history.replaceState(null, "", `#${id}`);
  };

  const visible = show && pastTitle;

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          key="dock"
          className="fixed top-1/2 left-2 z-40 -translate-y-1/2 sm:left-4"
          initial={{ x: -96, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
        >
          <div className="glass glass-refract rounded-[22px] p-2 sm:p-2.5">
            <Dock size={38} magnification={58}>
              <a
                href="#forge"
                onClick={go("forge")}
                aria-label="MintForge Eternal — back to the top"
                className="mx-auto mb-1 grid size-[38px] place-items-center rounded-2xl focus-visible:outline-2 focus-visible:outline-mint"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/hero/gem.webp" alt="" className="h-9 w-auto drop-shadow-[0_0_8px_rgba(63,230,212,0.6)]" />
              </a>
              <DockDivider />
              {LINKS.map((l) => (
                <DockItem key={l.id} label={l.label} icon={l.icon} href={`#${l.id}`} onClick={go(l.id)} active={active === l.id} />
              ))}
              <DockDivider />
              <DockItem
                label="Download the game"
                icon={<Download />}
                onClick={onDownload}
                aria-haspopup="dialog"
                className="!bg-gold !text-ink hover:!bg-gold-pale"
              />
            </Dock>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
