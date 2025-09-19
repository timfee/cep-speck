import { useMemo } from "react";

import { VALIDATION_THRESHOLDS } from "@/lib/constants";

// Regex patterns for field validation - extracted for maintainability and testing
const VALIDATION_PATTERNS = {
  // Flexible project pattern: matches "Project:", "project name:", "Project Name:", etc.
  PROJECT: /^(?:project(?:\s+name)?|name|title)\s*[:=]\s*.+/im,
  
  // Flexible target SKU pattern: matches various SKU formats
  TARGET_SKU: /^(?:target\s*)?(?:sku|tier|plan|edition)\s*[:=]\s*.+/im,
  
  // Objective patterns with common variations
  OBJECTIVE: /^(?:objective|goal|purpose|aim|intent)\s*[:=]/im,
  
  // Target users/audience patterns
  TARGET_USERS: /^(?:target\s*)?(?:audience|users?|customers?|personas?)\s*[:=]/im,
  
  // Structured format detection (key: value or key = value)
  STRUCTURED_LINE: /^\s*[a-z][a-z\s]*\s*[:=]\s*.+/i,
} as const;

export interface SpecValidation {
  hasProject: boolean;
  hasTargetSKU: boolean;
  hasDescription: boolean;
  estimatedWordCount: number;
  isStructuredFormat: boolean;
  suggestedSections: string[];
  completionScore: number; // 0-100
  issues: string[];
}

export function useSpecValidation(content: string): SpecValidation {
  return useMemo(() => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      return {
        hasProject: false,
        hasTargetSKU: false,
        hasDescription: false,
        estimatedWordCount: 0,
        isStructuredFormat: false,
        suggestedSections: [],
        completionScore: 0,
        issues: ["Specification is empty"],
      };
    }

    const lines = trimmedContent.split('\n');
    const words = trimmedContent.split(/\s+/);
    
    // Check for required fields using flexible patterns
    const hasProject = VALIDATION_PATTERNS.PROJECT.test(trimmedContent);
    const hasTargetSKU = VALIDATION_PATTERNS.TARGET_SKU.test(trimmedContent);
    const hasDescription = words.length > 10; // Basic heuristic
    
    // Check for structured format (colon-separated key-value pairs)
    const structuredLines = lines.filter(line => 
      VALIDATION_PATTERNS.STRUCTURED_LINE.test(line)
    ).length;
    const isStructuredFormat = structuredLines >= 2;
    
    // Suggested sections based on content analysis
    const suggestedSections = [];
    if (!hasProject) suggestedSections.push("Project: [Your project name]");
    if (!hasTargetSKU) suggestedSections.push("Target SKU: [premium|standard|enterprise]");
    if (!VALIDATION_PATTERNS.OBJECTIVE.test(trimmedContent)) {
      suggestedSections.push("Objective: [Primary goal]");
    }
    if (!VALIDATION_PATTERNS.TARGET_USERS.test(trimmedContent)) {
      suggestedSections.push("Target Users: [User personas]");
    }
    
    // Calculate completion score
    let score = 0;
    if (hasProject) score += VALIDATION_THRESHOLDS.MIN_WORD_COUNT;
    if (hasTargetSKU) score += VALIDATION_THRESHOLDS.MAX_WORD_COUNT;
    if (hasDescription) score += 20;
    if (isStructuredFormat) score += VALIDATION_THRESHOLDS.MIN_LINE_COUNT;
    if (words.length >= 20) score += VALIDATION_THRESHOLDS.MAX_LINE_COUNT;
    
    // Identify issues
    const issues = [];
    if (!hasProject) issues.push("Missing project name");
    if (!hasTargetSKU) issues.push("Missing target SKU");
    if (!isStructuredFormat) issues.push("Consider using structured format (key: value)");
    if (words.length < 10) issues.push("Specification seems too brief");
    if (words.length > 200) issues.push("Consider using more concise input for better AI generation");
    
    return {
      hasProject,
      hasTargetSKU,
      hasDescription,
      estimatedWordCount: words.length,
      isStructuredFormat,
      suggestedSections,
      completionScore: Math.min(score, 100),
      issues: issues.length > 0 ? issues : [],
    };
  }, [content]);
}