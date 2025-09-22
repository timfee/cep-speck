"use client";

import { motion } from "framer-motion";
import { Clock, FileText, Target, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  sublabel: string;
  colorClass: string;
  _animated?: boolean;
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

interface ProgressBarProps {
  progress: number;
  estimatedCompletion?: number;
}

export function ProgressBar({
  progress,
  estimatedCompletion,
}: ProgressBarProps) {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Overall Progress
        </span>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {estimatedCompletion && (
        <div className="text-xs text-muted-foreground mt-1">
          Est. {estimatedCompletion}s remaining
        </div>
      )}
    </Card>
  );
}

interface IssuesSummaryProps {
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

// Metric card configurations
export const METRIC_CONFIGS = {
  wordCount: {
    icon: FileText,
    label: "Words",
    sublabel: "Generated",
    colorClass:
      "from-blue-50 to-blue-100 border-blue-200 text-blue-600 [&>div:nth-child(2)]:text-blue-800 [&>div:last-child]:text-blue-600",
  },
  validationScore: {
    icon: Target,
    label: "Quality",
    sublabel: "Validation",
    colorClass:
      "from-green-50 to-green-100 border-green-200 text-green-600 [&>div:last-child]:text-green-600",
  },
  iterationAttempts: {
    icon: Zap,
    label: "Iterations",
    sublabel: "Attempts",
    colorClass:
      "from-amber-50 to-amber-100 border-amber-200 text-amber-600 [&>div:nth-child(2)]:text-amber-800 [&>div:last-child]:text-amber-600",
  },
  elapsedTime: {
    icon: Clock,
    label: "Time",
    sublabel: "Elapsed",
    colorClass:
      "from-purple-50 to-purple-100 border-purple-200 text-purple-600 [&>div:nth-child(2)]:text-purple-800 [&>div:last-child]:text-purple-600",
  },
} as const;

const SCORE_EXCELLENT = 80;
const SCORE_GOOD = 60;

export function getValidationScoreColor(score: number): string {
  if (score >= SCORE_EXCELLENT) return "text-green-600";
  if (score >= SCORE_GOOD) return "text-yellow-600";
  return "text-red-600";
}
