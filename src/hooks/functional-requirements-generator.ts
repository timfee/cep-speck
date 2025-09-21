/**
 * Functional requirements generation
 */

import type { FunctionalRequirement } from "@/types/workflow";

import {
  includesAnalyticsKeywords,
  includesCollaborationKeywords,
  includesEnterpriseKeywords,
  includesIntegrationKeywords,
} from "./requirement-keywords";

import {
  createAnalyticsRequirement,
  createCollaborationRequirement,
  createCoreFunctionalRequirement,
  createIntegrationRequirement,
  createSecurityRequirement,
} from "./requirement-templates";

/**
 * Generate functional requirements based on prompt analysis
 */
export function generateFunctionalRequirements(
  prompt: string
): FunctionalRequirement[] {
  const lowercasePrompt = prompt.toLowerCase();
  const requirements: FunctionalRequirement[] = [];

  // Core functionality (always included)
  requirements.push(createCoreFunctionalRequirement());

  // Enterprise/security requirements
  if (includesEnterpriseKeywords(lowercasePrompt)) {
    requirements.push(createSecurityRequirement());
  }

  // Integration requirements
  if (includesIntegrationKeywords(lowercasePrompt)) {
    requirements.push(createIntegrationRequirement());
  }

  // Collaboration requirements
  if (includesCollaborationKeywords(lowercasePrompt)) {
    requirements.push(createCollaborationRequirement());
  }

  // Analytics requirements
  if (includesAnalyticsKeywords(lowercasePrompt)) {
    requirements.push(createAnalyticsRequirement());
  }

  return requirements;
}