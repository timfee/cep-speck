/**
 * Content outline generation for structured workflow
 */

import type { ContentOutline } from "@/types/workflow";

import { generateFunctionalRequirements } from "./functional-requirements-generator";
import { generateMilestones } from "./milestones-generator";
import { generateSuccessMetrics } from "./success-metrics-generator";

/**
 * Generate complete content outline based on prompt analysis
 */
export function generateContentOutline(prompt: string): ContentOutline {
  return {
    functionalRequirements: generateFunctionalRequirements(prompt),
    successMetrics: generateSuccessMetrics(prompt),
    milestones: generateMilestones(),
  };
}