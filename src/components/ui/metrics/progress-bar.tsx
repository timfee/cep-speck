"use client";

import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";

export interface ProgressBarProps {
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
