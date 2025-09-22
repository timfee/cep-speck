import { motion } from "framer-motion";

import { UI_CONSTANTS, RETRY_LIMITS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const TIMING = {
  DOT_DURATION: 1.2,
  BAR_DURATION: 0.8,
  DEFAULT_DURATION: 1,
  RING_DURATION: 1.5,
  ELLIPSIS_DURATION: 1.2,
  INFINITE_DURATION: 2,
} as const;

export const ANIMATION_CONFIGS = {
  default: { rotate: 360, duration: TIMING.DEFAULT_DURATION },
  ring: { rotate: 360, duration: TIMING.RING_DURATION },
  ellipsis: { x: [0, 10, 0], duration: TIMING.ELLIPSIS_DURATION },
  bars: {
    scaleY: [1, UI_CONSTANTS.ANIMATION_SCALE_LARGE, 1],
    duration: TIMING.BAR_DURATION,
  },
  infinite: {
    rotate: 360,
    scale: [1, UI_CONSTANTS.ANIMATION_SCALE_MEDIUM, 1],
    duration: TIMING.INFINITE_DURATION,
  },
};

export function createAnimationProps(
  size: number,
  index: number,
  type: "dot" | "bar"
) {
  const isDot = type === "dot";

  return {
    className: isDot
      ? "rounded-full bg-current text-current"
      : "bg-current text-current",
    style: isDot
      ? {
          width: size / UI_CONSTANTS.ICON_SIZE,
          height: size / UI_CONSTANTS.ICON_SIZE,
        }
      : { width: size / UI_CONSTANTS.ICON_SIZE, height: size / 2 },
    animate: isDot
      ? {
          opacity: [
            UI_CONSTANTS.ANIMATION_SCALE_SMALL,
            1,
            UI_CONSTANTS.ANIMATION_SCALE_SMALL,
          ],
        }
      : { scaleY: [1, UI_CONSTANTS.ANIMATION_SCALE_LARGE, 1] },
    transition: {
      duration: isDot ? TIMING.DOT_DURATION : TIMING.BAR_DURATION,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay:
        index *
        (isDot
          ? UI_CONSTANTS.ANIMATION_OPACITY_MEDIUM
          : UI_CONSTANTS.ANIMATION_OPACITY),
    },
  };
}

export function SpinnerDots({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex space-x-1", className)}
      style={{ width: size * 2, height: size }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div key={i} {...createAnimationProps(size, i, "dot")} />
      ))}
    </div>
  );
}

export function SpinnerBars({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex space-x-1 items-end", className)}
      style={{ width: size, height: size }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div key={i} {...createAnimationProps(size, i, "bar")} />
      ))}
    </div>
  );
}

export function SpinnerSVG({
  variant,
  size,
  className,
}: {
  variant: string;
  size: number;
  className?: string;
}) {
  const isRing = variant === "ring";
  const strokeWidth = isRing ? 2 : RETRY_LIMITS.DEFAULT_MAX_ATTEMPTS;
  const config = ANIMATION_CONFIGS[variant as keyof typeof ANIMATION_CONFIGS];

  // Extract animate props without duration for framer motion
  const { duration: _duration, ...animateProps } = config;

  return (
    <motion.svg
      className={cn("text-current", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      animate={animateProps}
      transition={{
        duration: config.duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {isRing ? (
        <>
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeOpacity="0.3"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray="31.416"
            strokeDashoffset="23.562"
            transform="rotate(-90 12 12)"
          />
        </>
      ) : (
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="15.708"
        />
      )}
    </motion.svg>
  );
}
