import { serializeWorkflowToOutlinePayload } from "@/lib/serializers/workflow-to-structured-outline";

import type {
  SerializedWorkflowSpec,
  StructuredWorkflowState,
} from "@/types/workflow";

const SPEC_VERSION: SerializedWorkflowSpec["version"] = "phase-4";

export function serializeWorkflowToSpec(
  state: StructuredWorkflowState
): SerializedWorkflowSpec {
  const outline = serializeWorkflowToOutlinePayload(state);
  const overrides = buildOverrides(state.sectionContents);
  const finalDraft = state.finalPrd.trim();

  return {
    version: SPEC_VERSION,
    generatedAt: new Date().toISOString(),
    outline,
    workflow: {
      initialPrompt: state.initialPrompt,
      selectedSections: [...state.selectedSections],
      sectionOrder: [...state.sectionOrder],
      finalPrd: finalDraft.length > 0 ? finalDraft : undefined,
      openIssues: collectOpenIssues(state),
    },
    overrides,
  };
}

function buildOverrides(
  sectionContents: StructuredWorkflowState["sectionContents"]
): Record<string, string> {
  const overrides: Record<string, string> = {};
  for (const [sectionId, content] of Object.entries(sectionContents)) {
    if (typeof content !== "string") continue;
    const trimmed = content.trim();
    if (trimmed.length === 0) continue;
    overrides[sectionId] = trimmed;
  }
  return overrides;
}

function collectOpenIssues(state: StructuredWorkflowState): string[] {
  const issues: string[] = [];
  if (typeof state.error === "string") {
    const trimmed = state.error.trim();
    if (trimmed.length > 0) {
      issues.push(trimmed);
    }
  }
  return issues;
}

export {
  serializeWorkflowToLegacySpecText,
  validateLegacySpecText,
} from "./workflow-to-spec-legacy";
