import { useMemo } from "react";

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
    
    // Check for required fields
    const hasProject = /^project\s*:\s*.+/im.test(trimmedContent);
    const hasTargetSKU = /^target\s*sku\s*:\s*.+/im.test(trimmedContent);
    const hasDescription = words.length > 10; // Basic heuristic
    
    // Check for structured format (colon-separated key-value pairs)
    const structuredLines = lines.filter(line => 
      /^\s*[a-z\s]+\s*:\s*.+/i.test(line)
    ).length;
    const isStructuredFormat = structuredLines >= 2;
    
    // Suggested sections based on content analysis
    const suggestedSections = [];
    if (!hasProject) suggestedSections.push("Project: [Your project name]");
    if (!hasTargetSKU) suggestedSections.push("Target SKU: [premium|standard|enterprise]");
    if (!/objectives?\s*:/im.test(trimmedContent)) {
      suggestedSections.push("Objective: [Primary goal]");
    }
    if (!/target\s*(audience|users?)\s*:/im.test(trimmedContent)) {
      suggestedSections.push("Target Users: [User personas]");
    }
    
    // Calculate completion score
    let score = 0;
    if (hasProject) score += 25;
    if (hasTargetSKU) score += 25;
    if (hasDescription) score += 20;
    if (isStructuredFormat) score += 15;
    if (words.length >= 20) score += 15;
    
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