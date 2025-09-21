/**
 * Terminal line components for error display
 */

import { motion } from "framer-motion";
import React from "react";

interface AnimatedSpanProps {
  children: React.ReactNode;
  delay: number;
}

export function AnimatedSpan({ children, delay }: AnimatedSpanProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay / 1000, duration: 0.3 }}
      className="font-mono text-sm"
    >
      {children}
    </motion.div>
  );
}

interface TerminalLineProps {
  label: string;
  value: string;
  delay: number;
  valueColor?: string;
}

export function TerminalLine({
  label,
  value,
  delay,
  valueColor = "text-gray-300",
}: TerminalLineProps) {
  return (
    <AnimatedSpan delay={delay}>
      <span className="text-yellow-400">{label}:</span>{" "}
      <span className={valueColor}>{value}</span>
    </AnimatedSpan>
  );
}

interface ConditionalTerminalLineProps extends TerminalLineProps {
  condition: boolean;
}

export function ConditionalTerminalLine({
  condition,
  ...props
}: ConditionalTerminalLineProps) {
  if (!condition) return null;
  return <TerminalLine {...props} />;
}

export function TerminalPrompt({ delay }: { delay: number }) {
  return (
    <AnimatedSpan delay={delay}>
      <div className="flex items-center gap-2 mt-4 pt-2 border-t border-gray-700">
        <span className="text-gray-500">$</span>
        <span className="text-gray-500 animate-pulse">_</span>
      </div>
    </AnimatedSpan>
  );
}