import type { StructuredWorkflowState } from "@/types/workflow";

import {
  PROJECT_NAME_MAX_LENGTH,
  PROJECT_NAME_TRUNCATE_LENGTH,
  PROJECT_NAME_WORD_LIMIT,
} from "./constants";

import { formatList, formatTerm } from "./formatters";

export function buildMetadataBlock(state: StructuredWorkflowState): string[] {
  const { enterpriseParameters } = state;
  return [
    `Project: ${extractProjectName(state.initialPrompt)}`,
    `Target SKU: ${formatTerm(enterpriseParameters.targetSku)}`,
    `Deployment Model: ${formatTerm(enterpriseParameters.deploymentModel)}`,
    `Support Level: ${formatTerm(enterpriseParameters.supportLevel)}`,
    `Rollout Strategy: ${formatTerm(enterpriseParameters.rolloutStrategy)}`,
    `Security Requirements: ${formatList(
      enterpriseParameters.securityRequirements.map(formatTerm),
      "None documented"
    )}`,
    `Integrations: ${formatList(
      enterpriseParameters.integrations.map(formatTerm),
      "None documented"
    )}`,
  ];
}

export function extractProjectName(prompt: string): string {
  const lines = prompt.split("\n");
  const projectLine = lines.find((line) =>
    line.toLowerCase().includes("project")
  );
  if (projectLine !== undefined) {
    return projectLine.replace(/project[:\s]*/i, "").trim();
  }

  const words = prompt.split(/\s+/).slice(0, PROJECT_NAME_WORD_LIMIT).join(" ");
  return words.length > PROJECT_NAME_MAX_LENGTH
    ? `${words.substring(0, PROJECT_NAME_TRUNCATE_LENGTH)}...`
    : words;
}
