"use client";

import { motion } from "framer-motion";

import { UI_CONSTANTS, RETRY_LIMITS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface SpinnerProps {
  variant?: "default" | "ring" | "ellipsis" | "bars" | "infinite";
  size?: number;
  className?: string;
}

const TIMING = {
  DOT_DURATION: 1.2,
  BAR_DURATION: 0.8,
  DEFAULT_DURATION: 1,
  RING_DURATION: 1.5,
  ELLIPSIS_DURATION: 1.2,
  INFINITE_DURATION: 2,
} as const;

const ANIMATION_CONFIGS = {
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
} as const;

const TIMING = {
  DOT_DURATION: 1.2,
  BAR_DURATION: 0.8,
} as const;

const createAnimationProps = (
  size: number,
  index: number,
  type: "dot" | "bar"
) => {
  const baseStyle =
    type === "dot"
      ? {
          width: size / UI_CONSTANTS.ICON_SIZE,
          height: size / UI_CONSTANTS.ICON_SIZE,
        }
      : { width: size / UI_CONSTANTS.ICON_SIZE, height: size / 2 };

  const baseTransition = {
    duration: type === "dot" ? TIMING.DOT_DURATION : TIMING.BAR_DURATION,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };
  const delayMultiplier =
    type === "dot"
      ? UI_CONSTANTS.ANIMATION_OPACITY_MEDIUM
      : UI_CONSTANTS.ANIMATION_OPACITY;

  return {
    key: index,
    className:
      type === "dot"
        ? "rounded-full bg-current text-current"
        : "bg-current text-current",
    style: baseStyle,
    animate:
      type === "dot"
        ? {
            opacity: [
              UI_CONSTANTS.ANIMATION_SCALE_SMALL,
              1,
              UI_CONSTANTS.ANIMATION_SCALE_SMALL,
            ],
          }
        : { scaleY: [1, UI_CONSTANTS.ANIMATION_SCALE_LARGE, 1] },
    transition: { ...baseTransition, delay: index * delayMultiplier },
  };
};

const SpinnerDots = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => (
  <div
    className={cn("flex space-x-1", className)}
    style={{ width: size * 2, height: size }}
  >
    {[0, 1, 2].map((i) => (
      <motion.div key={i} {...createAnimationProps(size, i, "dot")} />
    ))}
  </div>
);

const SpinnerBars = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => (
  <div
    className={cn("flex space-x-1 items-end", className)}
    style={{ width: size, height: size }}
  >
    {[0, 1, 2].map((i) => (
      <motion.div key={i} {...createAnimationProps(size, i, "bar")} />
    ))}
  </div>
);

const SpinnerSVG = ({
  variant,
  size,
  className,
}: {
  variant: string;
  size: number;
  className?: string;
}) => {
  const isRing = variant === "ring";
  const strokeWidth = isRing ? 2 : RETRY_LIMITS.DEFAULT_MAX_ATTEMPTS;
  const config = ANIMATION_CONFIGS[variant as keyof typeof ANIMATION_CONFIGS];

  return (
    <motion.svg
      className={cn("text-current", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      animate={config}
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
};

export function Spinner({
  variant = "default",
  size = 16,
  className,
}: SpinnerProps) {
  if (variant === "ellipsis")
    return <SpinnerDots size={size} className={className} />;
  if (variant === "bars")
    return <SpinnerBars size={size} className={className} />;
  return <SpinnerSVG variant={variant} size={size} className={className} />;
}
