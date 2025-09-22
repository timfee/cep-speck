import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import {
  ANIMATION_CONFIGS,
  getAnimationStyles,
  getBarAnimation,
  getDotAnimation,
  TIMING,
} from "./spinner-animation-config";

const DOT_COUNT = 3;
const BAR_COUNT = 4;

export function createAnimationProps(
  size: number,
  index: number,
  type: "dot" | "bar"
) {
  const styles = getAnimationStyles(size, type);

  if (type === "dot") {
    const animation = getDotAnimation(index);
    return {
      ...styles,
      animate: { opacity: animation.opacity },
      transition: animation.transition,
    };
  } else {
    const animation = getBarAnimation(index);
    return {
      ...styles,
      animate: { scaleY: animation.scaleY },
      transition: animation.transition,
    };
  }
}

export function SpinnerDots({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1", className)}>
      {Array.from({ length: DOT_COUNT }, (_, index) => (
        <motion.div key={index} {...createAnimationProps(size, index, "dot")} />
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
    <div className={cn("flex gap-1 items-end", className)}>
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <motion.div key={index} {...createAnimationProps(size, index, "bar")} />
      ))}
    </div>
  );
}

export function SpinnerRing({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "border-2 border-current border-t-transparent rounded-full",
        className
      )}
      style={{ width: size, height: size }}
      animate={ANIMATION_CONFIGS.ring}
      transition={{
        duration: TIMING.RING_DURATION,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}
