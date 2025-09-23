import { FileText, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MetricConfig {
  icon: LucideIcon;
  label: string;
  sublabel: string;
  colorClass: string;
}

export const METRIC_CONFIGS: Record<
  "wordCount" | "iterationAttempts",
  MetricConfig
> = {
  wordCount: {
    icon: FileText,
    label: "Words",
    sublabel: "Generated",
    colorClass:
      "from-blue-50 to-blue-100 border-blue-200 text-blue-700 [&>div:nth-child(2)]:text-blue-900 [&>div:last-child]:text-blue-600",
  },
  iterationAttempts: {
    icon: Zap,
    label: "Iterations",
    sublabel: "Attempts",
    colorClass:
      "from-amber-50 to-amber-100 border-amber-200 text-amber-700 [&>div:nth-child(2)]:text-amber-900 [&>div:last-child]:text-amber-600",
  },
};
