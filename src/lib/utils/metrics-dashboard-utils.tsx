import { UI_CONSTANTS } from "@/lib/constants";
import { getProgressForPhase as getStreamPhaseProgress } from "@/lib/spec/helpers/phase-processing";

export function getPhaseProgress(phase: string): number {
  return getStreamPhaseProgress(phase);
}

export interface AnimationConfig {
  wordCountStep: number;
  intervalDelay: number;
  animationSteps: number;
}

export function createAnimationConfig(wordCount: number): AnimationConfig {
  const animationSteps = 20;
  return {
    wordCountStep: wordCount / animationSteps,
    intervalDelay: UI_CONSTANTS.THRESHOLD_LOW,
    animationSteps,
  };
}
