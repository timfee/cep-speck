// Serialization helpers for structured workflow

import type { StructuredWorkflowState } from "@/types/workflow";

// Serialize workflow state to spec text format
export function serializeToSpecText(state: StructuredWorkflowState): string {
  const { initialPrompt, contentOutline, enterpriseParameters } = state;

  let specText = `${initialPrompt}\n\n`;

  // Enterprise Parameters section
  specText += buildEnterpriseParametersSection(enterpriseParameters);

  // Content Outline section
  specText += buildContentOutlineSection(contentOutline);

  return specText;
}

// Build enterprise parameters section
function buildEnterpriseParametersSection(
  enterpriseParameters: StructuredWorkflowState["enterpriseParameters"]
): string {
  let section = `---Enterprise Parameters---\n`;
  section += `Target SKU: ${enterpriseParameters.targetSku}\n`;
  section += `Deployment: ${enterpriseParameters.deploymentModel}\n`;
  section += `Security: ${enterpriseParameters.securityRequirements.join(", ")}\n`;
  section += `Integrations: ${enterpriseParameters.integrations.join(", ")}\n\n`;
  return section;
}

// Build content outline section
function buildContentOutlineSection(
  contentOutline: StructuredWorkflowState["contentOutline"]
): string {
  let section = `---Content Outline---\n`;

  // Features section
  section += `## Features:\n`;
  for (const fr of contentOutline.functionalRequirements) {
    section += `- ${fr.title} (${fr.priority}): ${fr.description}\n`;
  }

  // Metrics section
  section += `\n## Metrics:\n`;
  for (const m of contentOutline.successMetrics) {
    section += `- ${m.name}: ${m.target ?? m.description}\n`;
  }

  return section;
}
