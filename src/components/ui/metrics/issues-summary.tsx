"use client";

import { motion } from "framer-motion";

export interface IssuesSummaryProps {
  issuesFound: number;
}

export function IssuesSummary({ issuesFound }: IssuesSummaryProps) {
  if (issuesFound === 0) return null;

  return (
    <motion.div
      className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      <span className="text-sm text-red-700">
        {issuesFound} validation issue{issuesFound !== 1 ? "s" : ""} found
      </span>
    </motion.div>
  );
}
