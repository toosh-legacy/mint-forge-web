"use client";

/**
 * Vertical magnifying dock — adapted from the horizontal "Apple-style dock" pattern.
 * The panel sits on the left edge; items grow as the pointer nears them along Y,
 * and labels fly out to the right. Items render real <a>/<button> elements so
 * keyboard and screen-reader users get normal link/button semantics.
 */
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "motion/react";
import { createContext, useContext, useRef, useState } from "react";
import clsx from "clsx";

const DEFAULT_SIZE = 40;
const DEFAULT_MAGNIFICATION = 64;
const DEFAULT_DISTANCE = 130;

type DockContextType = {
  mouseY: MotionValue<number>;
  spring: SpringOptions;
  size: number;
  magnification: number;
  distance: number;
};

const DockContext = createContext<DockContextType | undefined>(undefined);

function useDock() {
  const ctx = useContext(DockContext);
  if (!ctx) throw new Error("Dock items must be rendered inside <Dock>");
  return ctx;
}

type DockProps = {
  children: React.ReactNode;
  className?: string;
  /** Resting icon tile size in px. */
  size?: number;
  /** Tile size under the pointer in px. */
  magnification?: number;
  /** How far (px) along the dock the magnification reaches. */
  distance?: number;
  spring?: SpringOptions;
  label?: string;
};

export function Dock({
  children,
  className,
  size = DEFAULT_SIZE,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  spring = { mass: 0.1, stiffness: 160, damping: 13 },
  label = "Site navigation",
}: DockProps) {
  const mouseY = useMotionValue(Infinity);
  return (
    <motion.nav
      aria-label={label}
      onPointerMove={(e) => e.pointerType === "mouse" && mouseY.set(e.clientY)}
      onPointerLeave={() => mouseY.set(Infinity)}
      className={clsx("flex w-fit flex-col items-start gap-2.5", className)}
    >
      <DockContext.Provider value={{ mouseY, spring, size, magnification, distance }}>{children}</DockContext.Provider>
    </motion.nav>
  );
}

type DockItemProps = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  active?: boolean;
  className?: string;
  "aria-haspopup"?: "dialog";
};

export function DockItem({ label, icon, href, onClick, active, className, ...rest }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { mouseY, spring, size, magnification, distance } = useDock();
  const [hover, setHover] = useState(false);

  const offset = useTransform(mouseY, (y) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? y - r.top - r.height / 2 : Infinity;
  });
  const tile = useSpring(useTransform(offset, [-distance, 0, distance], [size, magnification, size]), spring);
  const iconSize = useTransform(tile, (v) => v * 0.48);

  const tileClass = clsx(
    "relative grid place-items-center rounded-2xl outline-none transition-colors duration-150",
    "focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
    active ? "bg-mint/20 text-mint-glow" : "bg-white/[0.06] text-text/85 hover:bg-white/[0.12] hover:text-white",
    className,
  );
  const inner = (
    <motion.span style={{ width: iconSize, height: iconSize }} className="grid place-items-center [&>svg]:size-full">
      {icon}
    </motion.span>
  );
  const handlers = {
    onPointerEnter: () => setHover(true),
    onPointerLeave: () => setHover(false),
    onFocus: () => setHover(true),
    onBlur: () => setHover(false),
    onClick,
    "aria-label": label,
    "aria-current": active ? ("location" as const) : undefined,
    className: "grid size-full place-items-center rounded-2xl",
    ...rest,
  };

  return (
    <motion.div ref={ref} style={{ width: tile, height: tile }} className={tileClass}>
      {href ? <a href={href} {...handlers}>{inner}</a> : <button type="button" {...handlers}>{inner}</button>}
      <AnimatePresence>
        {hover && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            className="font-heading pointer-events-none absolute top-1/2 left-full ml-3 -translate-y-1/2 rounded-lg bg-ink/90 px-2.5 py-1 text-[13px] font-semibold whitespace-nowrap text-text shadow-lg ring-1 ring-white/10"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {active && <span aria-hidden className="absolute top-1/2 -left-2.5 h-5 w-1 -translate-y-1/2 rounded-full bg-mint" />}
    </motion.div>
  );
}

export function DockDivider() {
  return <span aria-hidden className="mx-auto my-0.5 h-px w-6 bg-white/12" />;
}
