"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import {
  IssuesSummary,
  MetricCard,
  METRIC_CONFIGS,
  ProgressBar,
  getValidationScoreColor,
} from "./metrics-dashboard-components";

import {
  createAnimationConfig,
  getPhaseProgress,
} from "./metrics-dashboard-utils";

export interface WorkflowMetrics {
  wordCount: number;
  validationScore: number;
  iterationAttempts: number;
  elapsedTime: number;
  estimatedCompletion?: number;
  issuesFound: number;
  phase: string;
}

export interface MetricsDashboardProps {
  metrics: WorkflowMetrics;
  streaming?: boolean;
  className?: string;
}

export function MetricsDashboard({
  metrics,
  streaming = false,
  className,
}: MetricsDashboardProps) {
  const [animatedWordCount, setAnimatedWordCount] = useState(0);
  const [animatedValidationScore, setAnimatedValidationScore] = useState(0);

  // Animate numbers for visual appeal
  useEffect(() => {
    const config = createAnimationConfig(
      metrics.wordCount,
      metrics.validationScore
    );
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setAnimatedWordCount(
        Math.min(Math.floor(config.wordCountStep * step), metrics.wordCount)
      );
      setAnimatedValidationScore(
        Math.min(
          Math.floor(config.validationStep * step),
          metrics.validationScore
        )
      );

      if (step >= config.animationSteps) {
        clearInterval(interval);
      }
    }, config.intervalDelay);

    return () => clearInterval(interval);
  }, [metrics.wordCount, metrics.validationScore]);

  const progress = getPhaseProgress(metrics.phase);

  return (
    <motion.div
      className={cn("space-y-4", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          {...METRIC_CONFIGS.wordCount}
          value={streaming ? animatedWordCount : metrics.wordCount}
        />
        <MetricCard
          {...METRIC_CONFIGS.validationScore}
          value={`${streaming ? animatedValidationScore : metrics.validationScore}%`}
          colorClass={`${METRIC_CONFIGS.validationScore.colorClass} [&>div:nth-child(2)]:${getValidationScoreColor(metrics.validationScore)}`}
        />
        <MetricCard
          {...METRIC_CONFIGS.iterationAttempts}
          value={metrics.iterationAttempts}
        />
        <MetricCard
          {...METRIC_CONFIGS.elapsedTime}
          value={`${metrics.elapsedTime}s`}
        />
      </div>

      <ProgressBar
        progress={progress}
        estimatedCompletion={metrics.estimatedCompletion}
      />

      <IssuesSummary issuesFound={metrics.issuesFound} />
    </motion.div>
  );
}
