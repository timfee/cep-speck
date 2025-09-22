/**
 * Spinner animation configurations and utilities
 */
import { UI_CONSTANTS } from "@/lib/constants";

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

/**
 * Calculate animation styles for dots and bars
 */
export function getAnimationStyles(size: number, type: "dot" | "bar") {
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
  };
}

/**
 * Calculate dot animation properties
 */
export function getDotAnimation(index: number) {
  return {
    opacity: [
      UI_CONSTANTS.ANIMATION_SCALE_SMALL,
      1,
      UI_CONSTANTS.ANIMATION_SCALE_SMALL,
    ],
    transition: {
      duration: TIMING.DOT_DURATION,
      repeat: Infinity,
      delay: index * 0.2,
    },
  };
}

/**
 * Calculate bar animation properties
 */
export function getBarAnimation(index: number) {
  return {
    scaleY: [1, UI_CONSTANTS.ANIMATION_SCALE_LARGE, 1],
    transition: {
      duration: TIMING.BAR_DURATION,
      repeat: Infinity,
      delay: index * 0.1,
    },
  };
}