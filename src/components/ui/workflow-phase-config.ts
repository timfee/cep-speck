/**
 * Workflow phase configuration and types
 */

import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

// Define valid phase types
export type WorkflowPhase =
  | "starting"
  | "generating"
  | "validating"
  | "failed"
  | "done"
  | "error"
  | "";

export interface PhaseConfig {
  status: "maintenance" | "degraded" | "online" | "offline";
  spinner: "ring" | "infinite" | "ellipsis" | "bars" | null;
  bgColor: string;
  borderClasses: string;
  progressClasses: string;
  label: string;
  description: string;
  icon: typeof Loader2;
}

// Comprehensive phase configuration with explicit class mappings
export const PHASE_CONFIG: Record<WorkflowPhase, PhaseConfig> = {
  starting: {
    status: "maintenance",
    spinner: "ring",
    bgColor: "bg-blue-50 border-blue-200 text-blue-700",
    borderClasses: "border-blue-500",
    progressClasses: "bg-blue-100",
    label: "Initializing",
    description: "Setting up PRD generation",
    icon: Loader2,
  },
  generating: {
    status: "maintenance",
    spinner: "infinite",
    bgColor: "bg-blue-50 border-blue-200 text-blue-700",
    borderClasses: "border-blue-500",
    progressClasses: "bg-blue-100",
    label: "Generating Content",
    description: "AI is creating your PRD document",
    icon: Loader2,
  },
  validating: {
    status: "degraded",
    spinner: "ellipsis",
    bgColor: "bg-amber-50 border-amber-200 text-amber-700",
    borderClasses: "border-amber-500",
    progressClasses: "bg-amber-100",
    label: "Validating Output",
    description: "Checking against validation rules",
    icon: Clock,
  },
  failed: {
    status: "offline",
    spinner: null,
    bgColor: "bg-red-50 border-red-200 text-red-700",
    borderClasses: "border-red-500",
    progressClasses: "bg-red-100",
    label: "Validation Failed",
    description: "Content generated but validation issues found",
    icon: XCircle,
  },
  done: {
    status: "online",
    spinner: null,
    bgColor: "bg-green-50 border-green-200 text-green-700",
    borderClasses: "border-green-500",
    progressClasses: "bg-green-100",
    label: "Generation Complete",
    description: "PRD successfully generated and validated",
    icon: CheckCircle,
  },
  error: {
    status: "offline",
    spinner: null,
    bgColor: "bg-red-50 border-red-200 text-red-700",
    borderClasses: "border-red-500",
    progressClasses: "bg-red-100",
    label: "Generation Failed",
    description: "An error occurred during generation",
    icon: XCircle,
  },
  "": {
    status: "offline",
    spinner: null,
    bgColor: "bg-gray-50 border-gray-200 text-gray-700",
    borderClasses: "border-gray-500",
    progressClasses: "bg-gray-100",
    label: "Ready",
    description: "Ready to start PRD generation",
    icon: Clock,
  },
};

export const TIMELINE_PHASES: WorkflowPhase[] = [
  "starting",
  "generating",
  "validating",
  "failed",
  "done",
];

/**
 * Get phase configuration with fallback
 */
export function getPhaseConfig(phase: string): PhaseConfig {
  return PHASE_CONFIG[phase as WorkflowPhase] || PHASE_CONFIG[""];
}
