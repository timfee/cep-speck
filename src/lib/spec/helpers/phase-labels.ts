/**
 * Phase labels and descriptions for UI display
 */

import type { StreamPhase } from "@/lib/spec/types";

export const PHASE_LABELS: Partial<Record<StreamPhase, string>> = {
  "loading-knowledge": "Loading",
  "performing-research": "Research",
  generating: "Generating",
  validating: "Validating",
  evaluating: "Evaluating",
  healing: "Refining",
  "self-reviewing": "Self review",
  done: "Complete",
  failed: "Failed",
  error: "Error",
};

export const TIMELINE_LABELS: Partial<Record<StreamPhase, string>> = {
  "loading-knowledge": "Loading knowledge",
  "performing-research": "Researching context",
  generating: "Generating draft",
  validating: "Validating content",
  evaluating: "Evaluating quality",
  healing: "Refining content",
  "self-reviewing": "Self reviewing",
  done: "Generation complete",
  failed: "Generation failed",
  error: "Error occurred",
};

/**
 * Progress mapping for different workflow phases
 */
export const PHASE_PROGRESS_MAP: Record<string, number> = {
  "loading-knowledge": 10,
  "performing-research": 20,
  generating: 40,
  validating: 60,
  evaluating: 70,
  "self-reviewing": 75,
  healing: 85,
  done: 100,
  failed: 0,
  error: 0,
};

/**
 * Human-readable descriptions for each phase
 */
export const PHASE_DESCRIPTIONS: Record<string, string> = {
  "loading-knowledge": "Loading knowledge base...",
  "performing-research": "Researching competitors...",
  generating: "Creating PRD content...",
  validating: "Checking content quality...",
  evaluating: "Analyzing semantic coherence...",
  "self-reviewing": "Performing self review...",
  healing: "Refining and fixing issues...",
  done: "PRD generation complete!",
  failed: "Generation failed",
  error: "An error occurred during processing",
};
