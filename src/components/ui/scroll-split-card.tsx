"use client";

/**
 * ScrollSplitCard — a scroll-driven card that separates into three panels and flips
 * each one to reveal custom content. API-compatible with @componentry/scroll-split-card
 * (imageSrc / cards / containerRef / className), rebuilt on `motion/react`, plus:
 *   - progress:   drive it from an outer scroll scene instead of its own scroll region
 *   - front:      any ReactNode to split across the panels (defaults to imageSrc)
 *   - renderBack: custom back face per panel
 *   - orientation: "vertical" (columns, flips on Y) or "horizontal" (rows, flips on X)
 * Only transform/opacity animate.
 */

import { useRef, type ReactNode, type RefObject } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import clsx from "clsx";

export type ScrollSplitCardItem = {
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
  icon?: ReactNode;
};

type Props = {
  imageSrc?: string;
  cards: ScrollSplitCardItem[];
  containerRef?: RefObject<HTMLElement | null>;
  className?: string;
  progress?: MotionValue<number>;
  /** A node split across the panels, or a function returning each panel's copy. */
  front?: ReactNode | ((index: number) => ReactNode);
  renderBack?: (index: number) => ReactNode;
  orientation?: "vertical" | "horizontal";
  onSelect?: (index: number) => void;
  /** Rendered above the panels (e.g. a heading); receives the split progress. */
  overlay?: (progress: MotionValue<number>) => ReactNode;
};

// Timeline (0→1): separate 0–0.18, flips staggered 0.22–0.72, then hold.
const SEPARATE: [number, number] = [0, 0.18];
const flipRange = (i: number): [number, number] => [0.22 + i * 0.1, 0.42 + i * 0.1];

export function ScrollSplitCard(props: Props) {
  if (props.progress) return <SplitStage {...props} progress={props.progress} />;
  return <SelfScrolling {...props} />;
}

function SelfScrolling(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    container: props.containerRef,
    offset: ["start start", "end end"],
  });
  return (
    <div ref={ref} className={clsx("relative h-[400vh]", props.className)}>
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <SplitStage {...props} progress={scrollYProgress} />
      </div>
    </div>
  );
}

function SplitStage({
  imageSrc,
  cards,
  progress,
  front,
  renderBack,
  orientation = "vertical",
  onSelect,
  overlay,
}: Props & { progress: MotionValue<number> }) {
  const vertical = orientation === "vertical";
  const scale = useTransform(progress, SEPARATE, [1, vertical ? 0.76 : 0.9]);
  // Rows (phone): shrink the whole stack toward the bottom so a heading fits above it.
  const stackScale = useTransform(progress, SEPARATE, [1, vertical ? 1 : 0.83]);
  const shiftY = useTransform(progress, SEPARATE, ["0vh", vertical ? "9vh" : "-1.5vh"]);
  const radius = useTransform(progress, SEPARATE, [0, 22]);

  const frontFor = (i: number) => (typeof front === "function" ? front(i) : front);
  const frontNode =
    typeof front === "function" ? null : front ??
    (imageSrc ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
    ) : null);

  return (
    <div className="absolute inset-0" style={{ perspective: 1800 }}>
      <motion.div
        className={clsx("absolute inset-0 flex", vertical ? "flex-row" : "flex-col")}
        style={{ y: shiftY, scale: stackScale, transformOrigin: "50% 100%" }}
      >
        {cards.slice(0, 3).map((card, i) => (
          <Panel
            key={i}
            index={i}
            card={card}
            progress={progress}
            scale={scale}
            radius={radius}
            vertical={vertical}
            front={typeof front === "function" ? frontFor(i) : frontNode}
            back={renderBack?.(i)}
            onSelect={onSelect}
          />
        ))}
      </motion.div>
      {overlay?.(progress)}
    </div>
  );
}

function Panel({
  index,
  card,
  progress,
  scale,
  radius,
  vertical,
  front,
  back,
  onSelect,
}: {
  index: number;
  card: ScrollSplitCardItem;
  progress: MotionValue<number>;
  scale: MotionValue<number>;
  radius: MotionValue<number>;
  vertical: boolean;
  front: ReactNode;
  back?: ReactNode;
  onSelect?: (i: number) => void;
}) {
  const [a, b] = flipRange(index);
  const mid = (a + b) / 2;
  const rotate = useTransform(progress, [a, b], [0, 180]);
  // Lift toward the viewer mid-flip so it reads as a physical card turning.
  const lift = useTransform(progress, [a, mid, b], [1, 1.07, 1]);
  const combined = useTransform([scale, lift], ([s, l]: number[]) => s * l);
  const glow = useTransform(progress, [a, mid, b], [0, 1, 0.35]);
  const frontVis = useTransform(progress, (v) => (v > mid ? "hidden" : "visible"));
  const backVis = useTransform(progress, (v) => (v > mid ? "visible" : "hidden"));

  return (
    <motion.div
      className="relative flex-1 cursor-pointer"
      style={{
        scale: combined,
        rotateY: vertical ? rotate : 0,
        rotateX: vertical ? 0 : rotate,
        transformStyle: "preserve-3d",
      }}
      onClick={() => progress.get() > mid && onSelect?.(index)}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? `Open ${card.title}` : undefined}
      onKeyDown={(e) => {
        if (onSelect && progress.get() > mid && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(index);
        }
      }}
    >
      {/* Front: the shared image/node, offset so the three panels form one picture. */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: radius, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", visibility: frontVis }}
      >
        <div
          className="absolute"
          style={
            vertical
              ? { top: 0, bottom: 0, width: "300%", left: `${-index * 100}%` }
              : { left: 0, right: 0, height: "300%", top: `${-index * 100}%` }
          }
        >
          {front}
        </div>
      </motion.div>

      {/* Back */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: radius,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          visibility: backVis,
          transform: vertical ? "rotateY(180deg)" : "rotateX(180deg)",
          background: card.bgColor,
          color: card.textColor,
        }}
      >
        {back ?? (
          <div className="flex h-full flex-col justify-end gap-3 p-8">
            {card.icon}
            <h3 className="text-2xl font-semibold">{card.title}</h3>
            <p className="opacity-80">{card.description}</p>
          </div>
        )}
      </motion.div>

      {/* Edge glint while turning */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: glow,
          borderRadius: radius,
          boxShadow: "0 0 60px 6px rgba(63,230,212,0.35)",
        }}
      />
    </motion.div>
  );
}
