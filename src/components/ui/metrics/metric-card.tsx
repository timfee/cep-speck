"use client";

import { motion } from "framer-motion";

import type { MetricConfig } from "./metric-configs";

export interface MetricCardProps extends MetricConfig {
  value: number | string;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  sublabel,
  colorClass,
}: MetricCardProps) {
  return (
    <motion.div
      className={`bg-gradient-to-br p-3 rounded-lg border ${colorClass}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs">{sublabel}</div>
    </motion.div>
  );
}
