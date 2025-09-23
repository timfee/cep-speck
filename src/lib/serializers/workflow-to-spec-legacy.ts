import type { StructuredWorkflowState } from "@/types/workflow";

import {
  MIN_SPEC_TEXT_LENGTH,
  REQUIRED_HEADERS,
} from "./workflow-to-spec/constants";

import { buildMetadataBlock } from "./workflow-to-spec/metadata";

import {
  buildNormalizedSectionMap,
  pickOverride,
} from "./workflow-to-spec/normalization";

import { placeholder } from "./workflow-to-spec/placeholders";
import { SECTION_DEFINITIONS } from "./workflow-to-spec/sections";

import type {
  SectionContentMap,
  SectionDefinition,
} from "./workflow-to-spec/types";

export function serializeWorkflowToLegacySpecText(
  state: StructuredWorkflowState
): string {
  const overrides = buildNormalizedSectionMap(state.sectionContents);
  const output: string[] = [...buildMetadataBlock(state), ""];

  let index = 0;
  for (const definition of SECTION_DEFINITIONS) {
    appendLegacySection(output, definition, index, state, overrides);
    index += 1;
  }

  return output.join("\n").trim();
}

export function validateLegacySpecText(specText: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!specText.includes("Project:")) {
    issues.push("Missing project metadata");
  }

  if (!specText.includes("Target SKU:")) {
    issues.push("Missing target SKU");
  }

  for (const header of REQUIRED_HEADERS) {
    if (!specText.includes(header)) {
      issues.push(`Missing section: ${header}`);
    }
  }

  if (specText.length < MIN_SPEC_TEXT_LENGTH) {
    issues.push("Spec text is too short");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

function appendLegacySection(
  output: string[],
  definition: SectionDefinition,
  index: number,
  state: StructuredWorkflowState,
  overrides: SectionContentMap
): void {
  const overrideContent = pickOverride(overrides, definition.overrideKeys);
  const builtContent =
    overrideContent ?? definition.build(state, overrides) ?? "";
  const trimmedContent = builtContent.trim();

  output.push(`# ${index + 1}. ${definition.title}`);
  output.push(
    trimmedContent.length > 0
      ? trimmedContent
      : placeholder(definition.placeholder)
  );
  output.push("");
}
