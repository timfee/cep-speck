import { useMemo } from "react";

import { INPUT_VALIDATION } from "@/lib/constants";

export interface ValidationResult {
  issues: string[];
  completionScore: number;
  estimatedWordCount: number;
  suggestedSections: string[];
}

export function useSpecValidation(spec: string): ValidationResult {
  return useMemo(() => {
    const trimmedSpec = spec.trim();
    if (!trimmedSpec) {
      return {
        issues: ["Specification is empty"],
        completionScore: 0,
        estimatedWordCount: 0,
        suggestedSections: [],
      };
    }

    const words = trimmedSpec.split(/\s+/);
    const hasProject = /^(?:project(?:\s+name)?|name|title)\s*[:=]\s*.+/im.test(
      trimmedSpec
    );
    const hasTargetSku =
      /^(?:target\s*)?(?:sku|tier|plan|edition)\s*[:=]\s*.+/im.test(
        trimmedSpec
      );
    const hasObjective = /^(?:objective|goal|purpose|aim|intent)\s*[:=]/im.test(
      trimmedSpec
    );

    const issues: string[] = [];

    if (!hasProject) issues.push("Missing project name");
    if (!hasTargetSku) issues.push("Missing target SKU");
    if (words.length < INPUT_VALIDATION.MIN_WORDS)
      issues.push("Specification seems too brief");

    const suggestedSections: string[] = [];
    if (!hasProject) suggestedSections.push("Project: [Your project name]");
    if (!hasTargetSku)
      suggestedSections.push("Target SKU: [premium|standard|enterprise]");
    if (!hasObjective) suggestedSections.push("Objective: [Primary goal]");

    let score = 0;
    if (hasProject) score += INPUT_VALIDATION.SCORE_INCREMENT;
    if (hasTargetSku) score += INPUT_VALIDATION.SCORE_INCREMENT;
    if (words.length >= INPUT_VALIDATION.MIN_SUBSTANTIAL_WORDS)
      score += INPUT_VALIDATION.SCORE_INCREMENT;
    if (words.length >= INPUT_VALIDATION.MIN_WORDS)
      score += INPUT_VALIDATION.SCORE_INCREMENT;

    return {
      issues,
      completionScore: Math.min(score, INPUT_VALIDATION.MAX_SCORE),
      estimatedWordCount: words.length,
      suggestedSections,
    };
  }, [spec]);
}
