import { RETRY_LIMITS, UI_CONSTANTS } from "@/lib/constants";

export function getPhaseProgress(phase: string): number {
  switch (phase) {
    case "starting":
      return RETRY_LIMITS.CRITICAL_RETRIES + 2; // 10
    case "generating":
      return UI_CONSTANTS.THRESHOLD_LOW;
    case "validating":
      return UI_CONSTANTS.SCORE_GOOD;
    case "done":
      return 100;
    case "error":
      return 0;
    default:
      return 0;
  }
}

export interface AnimationConfig {
  wordCountStep: number;
  validationStep: number;
  intervalDelay: number;
  animationSteps: number;
}

export function createAnimationConfig(
  wordCount: number,
  validationScore: number
): AnimationConfig {
  const animationSteps = 20;
  return {
    wordCountStep: wordCount / animationSteps,
    validationStep: validationScore / animationSteps,
    intervalDelay: UI_CONSTANTS.THRESHOLD_LOW,
    animationSteps,
  };
}
