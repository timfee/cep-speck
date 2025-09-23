"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { summarizePhaseStatus } from "@/lib/spec/helpers/phase-processing";
import type { StreamPhase } from "@/lib/spec/types";
import { cn } from "@/lib/utils";

import { IssuesSummary } from "./metrics/issues-summary";
import { MetricCard } from "./metrics/metric-card";
import { METRIC_CONFIGS } from "./metrics/metric-configs";
import { PhaseMetricCards } from "./metrics/phase-metric-cards";
import { ProgressBar } from "./metrics/progress-bar";
import { useAnimatedWordCount } from "./metrics/use-animated-word-count";
import { getPhaseProgress } from "./metrics-dashboard-utils";

export interface MetricsDashboardProps {
  wordCount: number;
  phase: string;
  phaseStatus: Partial<
    Record<
      StreamPhase,
      {
        attempts: number;
        issues: number;
        lastMessage?: string;
      }
    >
  >;
  streaming?: boolean;
  className?: string;
}

export function MetricsDashboard({
  wordCount,
  phase,
  phaseStatus,
  streaming = false,
  className,
}: MetricsDashboardProps) {
  const animatedWordCount = useAnimatedWordCount(wordCount);

  const progress = getPhaseProgress(phase);
  const activePhases = useMemo(
    () => summarizePhaseStatus(phaseStatus),
    [phaseStatus]
  );

  return (
    <motion.div
      className={cn("space-y-4", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          {...METRIC_CONFIGS.wordCount}
          value={streaming ? animatedWordCount : wordCount}
        />
        <PhaseMetricCards phases={activePhases} />
      </div>

      <ProgressBar progress={progress} />

      <IssuesSummary issuesFound={phaseStatus["validating"]?.issues ?? 0} />
    </motion.div>
  );
}
