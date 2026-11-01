"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MERCH, type MerchItem } from "@/config/site";

const ease = [0.16, 1, 0.3, 1] as const;

export function Merch() {
  return (
    <section id="merch" className="relative px-4 pt-20 pb-16 sm:px-8 md:pt-28 md:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
        style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(233,180,76,0.12), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="font-display text-mint-glow text-5xl font-black tracking-[-0.02em] sm:text-7xl">Merch from the forge</h2>
          <p className="mt-5 max-w-xl text-text-dim">
            Foil prints, apparel and relics from the forge. The first run is still on the anvil — join the list and you&apos;ll hear first.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MERCH.map((item, i) => (
            <MerchCard key={item.name} item={item} index={i} />
          ))}
        </div>

        <Notify />
      </div>
    </section>
  );
}

function MerchCard({ item, index }: { item: MerchItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Pointer tilt via CSS variables — no React re-render per frame.
  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    // Write transforms directly (not inherited CSS vars) so children skip style recalc.
    el.style.transform = `rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg)`;
    if (sheen.current)
      sheen.current.style.background = `radial-gradient(40% 40% at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.18), transparent 70%)`;
  };
  const onLeave = () => {
    ref.current!.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.08, ease }}
      style={{ perspective: 1000 }}
    >
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="glass group relative overflow-hidden rounded-3xl p-4 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
      >
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-2xl"
          style={{ background: `radial-gradient(70% 70% at 50% 40%, ${item.tint}33, #111415 75%)` }}
        >
          {item.fit === "card" ? (
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw"
              className="object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.05] group-hover:-rotate-2"
              style={{ filter: `drop-shadow(0 16px 24px rgba(0,0,0,0.6))` }}
            />
          ) : (
            <div
              className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              style={{ transformOrigin: "50% 50%" }}
            >
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(min-width:1024px) 60vw, 100vw"
                className="object-cover"
                style={{
                  objectPosition: `${item.focus?.x ?? 50}% ${item.focus?.y ?? 50}%`,
                  transform: `scale(${item.focus?.zoom ?? 1})`,
                  transformOrigin: `${item.focus?.x ?? 50}% ${item.focus?.y ?? 50}%`,
                  filter: "drop-shadow(0 16px 24px rgba(0,0,0,0.6))",
                }}
              />
            </div>
          )}
          {/* Sheen that follows the pointer */}
          <div
            ref={sheen}
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          <span className="absolute top-3 left-3 rounded-full border border-gold/40 bg-black/50 px-3 py-1 text-[13px] text-gold-pale backdrop-blur-sm">
            Coming soon
          </span>
        </div>
        <div className="flex items-end justify-between gap-3 px-2 pt-4 pb-1">
          <div>
            <h3 className="font-heading text-lg text-text">{item.name}</h3>
            <p className="mt-0.5 text-sm text-text-dim">{item.kind}</p>
          </div>
          <span className="font-heading text-sm text-gold/70">— —</span>
        </div>
      </div>
    </motion.div>
  );
}

function Notify() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // Not wired to a backend yet — swap this for Formspree / your API when the store opens.
    setState(/^\S+@\S+\.\S+$/.test(email) ? "done" : "error");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, ease }}
      id="join"
      className="glass glass-gold glass-refract mx-auto mt-16 max-w-2xl scroll-mt-28 rounded-3xl p-6 sm:p-8"
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4"
          >
            <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
              <motion.circle cx="22" cy="22" r="20" fill="none" stroke="var(--mint)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
              <motion.path d="M13 22.5l6 6 12-13" fill="none" stroke="var(--mint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.4 }} />
            </svg>
            <div>
              <p className="font-heading text-lg text-text">You&apos;re on the list.</p>
              <p className="text-sm text-text-dim">We&apos;ll send word to {email} when the first run is forged.</p>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" exit={{ opacity: 0, y: -8 }} onSubmit={submit} noValidate>
            <label htmlFor="notify" className="font-heading text-lg font-semibold text-gold-pale">
              Notify me when the store opens
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="notify"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@realm.gg"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                aria-invalid={state === "error"}
                aria-describedby={state === "error" ? "notify-err" : undefined}
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-black/30 px-5 py-3 text-base text-text placeholder:text-text-dim/60 outline-none transition-colors focus:border-mint/60 focus:bg-black/40"
              />
              <button
                type="submit"
                className="px-6 py-3 text-base rounded-full bg-gold font-heading font-bold text-ink transition-[background-color,transform] duration-150 hover:bg-gold-pale active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
              >
                Notify me
              </button>
            </div>
            <AnimatePresence>
              {state === "error" && (
                <motion.p
                  id="notify-err"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 pl-5 text-sm text-ember"
                >
                  That doesn&apos;t look like an email address.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
