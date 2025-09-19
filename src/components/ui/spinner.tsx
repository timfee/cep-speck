"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface SpinnerProps {
  variant?: "default" | "ring" | "ellipsis" | "bars" | "infinite";
  size?: number;
  className?: string;
}

const spinnerVariants = {
  default: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: "linear" as const },
  },
  ring: {
    animate: { rotate: 360 },
    transition: { duration: 1.5, repeat: Infinity, ease: "linear" as const },
  },
  ellipsis: {
    animate: { x: [0, 10, 0] },
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" as const },
  },
  bars: {
    animate: { scaleY: [1, 1.5, 1] },
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" as const },
  },
  infinite: {
    animate: { rotate: 360, scale: [1, 1.1, 1] },
    transition: { duration: 2, repeat: Infinity, ease: "linear" as const },
  },
};

export function Spinner({
  variant = "default",
  size = 16,
  className,
}: SpinnerProps) {
  const baseClass = "text-current";

  if (variant === "ellipsis") {
    return (
      <div
        className={cn("flex space-x-1", className)}
        style={{ width: size * 2, height: size }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className={cn("rounded-full bg-current", baseClass)}
            style={{ width: size / 4, height: size / 4 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div
        className={cn("flex space-x-1 items-end", className)}
        style={{ width: size, height: size }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className={cn("bg-current", baseClass)}
            style={{ width: size / 4, height: size / 2 }}
            animate={{ scaleY: [1, 1.5, 1] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  // Ring and default variants
  const isRing = variant === "ring";
  const strokeWidth = isRing ? 2 : 3;
  const config = spinnerVariants[variant];

  return (
    <motion.svg
      className={cn(baseClass, className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      animate={config.animate}
      transition={config.transition}
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
