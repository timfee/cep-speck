"use client";

import { motion } from "framer-motion";
import { Clock, FileText, Target, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { UI_CONSTANTS, RETRY_LIMITS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface WorkflowMetrics {
  wordCount: number;
  validationScore: number;
  healingAttempts: number;
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

export function MetricsDashboard({ metrics, streaming = false, className }: MetricsDashboardProps) {
  const [animatedWordCount, setAnimatedWordCount] = useState(0);
  const [animatedValidationScore, setAnimatedValidationScore] = useState(0);

  // Animate numbers for visual appeal
  useEffect(() => {
    const wordCountStep = metrics.wordCount / 20;
    const validationStep = metrics.validationScore / 20;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setAnimatedWordCount(Math.min(Math.floor(wordCountStep * step), metrics.wordCount));
      setAnimatedValidationScore(Math.min(Math.floor(validationStep * step), metrics.validationScore));

      if (step >= 20) {
        clearInterval(interval);
      }
    }, UI_CONSTANTS.THRESHOLD_LOW);

    return () => clearInterval(interval);
  }, [metrics.wordCount, metrics.validationScore]);

  const getValidationColor = (score: number) => {
    if (score >= UI_CONSTANTS.SCORE_EXCELLENT) return "text-green-600";
    if (score >= UI_CONSTANTS.SCORE_GOOD) return "text-yellow-600";
    return "text-red-600";
  };

  const getPhaseProgress = (phase: string) => {
    switch (phase) {
      case 'starting': return RETRY_LIMITS.CRITICAL_RETRIES + 2; // 10
      case 'generating': return UI_CONSTANTS.THRESHOLD_LOW;
      case 'validating': return UI_CONSTANTS.SCORE_GOOD;
      case 'healing': return UI_CONSTANTS.THRESHOLD_HIGH;
      case 'done': return 100;
      case 'error': return 0;
      default: return 0;
    }
  };

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
        {/* Word Count */}
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">Words</span>
          </div>
          <div className="text-xl font-bold text-blue-800">
            {streaming ? animatedWordCount : metrics.wordCount}
          </div>
          <div className="text-xs text-blue-600">Generated</div>
        </motion.div>

        {/* Validation Score */}
        <motion.div
          className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Quality</span>
          </div>
          <div className={cn("text-xl font-bold", getValidationColor(metrics.validationScore))}>
            {streaming ? animatedValidationScore : metrics.validationScore}%
          </div>
          <div className="text-xs text-green-600">Validation</div>
        </motion.div>

        {/* Healing Attempts */}
        <motion.div
          className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-amber-600" />
            <span className="text-xs text-amber-700 font-medium">Healing</span>
          </div>
          <div className="text-xl font-bold text-amber-800">
            {metrics.healingAttempts}
          </div>
          <div className="text-xs text-amber-600">Attempts</div>
        </motion.div>

        {/* Elapsed Time */}
        <motion.div
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-purple-700 font-medium">Time</span>
          </div>
          <div className="text-xl font-bold text-purple-800">
            {metrics.elapsedTime}s
          </div>
          <div className="text-xs text-purple-600">Elapsed</div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
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
        {metrics.estimatedCompletion && (
          <div className="text-xs text-muted-foreground mt-1">
            Est. {metrics.estimatedCompletion}s remaining
          </div>
        )}
      </Card>

      {/* Issues Summary */}
      {metrics.issuesFound > 0 && (
        <motion.div
          className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-700">
            {metrics.issuesFound} validation issue{metrics.issuesFound !== 1 ? 's' : ''} found
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}