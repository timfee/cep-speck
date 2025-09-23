import { formatOutlineEnumerationsForPrompt } from "@/lib/constants/outline-enumerations";

import type {
  SerializedWorkflowOutline,
  SerializedWorkflowSpec,
} from "@/types/workflow";

import { invokeItemToPrompt } from "./registry";
import type { SpecPack } from "./types";

/**
 * Build system prompt for PRD generation from SpecPack configuration
 *
 * @param pack - SpecPack containing validation items and composition rules
 * @returns Formatted system prompt with all validation constraints
 */
export function buildSystemPrompt(pack: SpecPack): string {
  const lines: string[] = [];
  for (const def of pack.items) {
    const p = invokeItemToPrompt(def, pack);
    if (p) lines.push(`- [${def.kind}] ${p}`);
  }
  if ((pack.composition?.labelPattern ?? "").length > 0) {
    lines.push(
      `- [structure] Header label pattern: ${pack.composition?.labelPattern}`
    );
  }
  if ((pack.composition?.headerRegex ?? "").length > 0) {
    lines.push(
      `- [structure] Header detection regex: ${pack.composition?.headerRegex}`
    );
  }
  return `You are generating a PRD for Chrome Enterprise Premium (CEP). Write as an L7+ Google PM: precise, factual, executive-level thinking. Voice: direct, concise, technically sophisticated. No marketing language, sensationalist claims, cutesy headings, or empty business speak. Use web search capabilities for competitor research with current data and citations. Do not invent facts; use placeholders when uncertain. Avoid quality theater metrics like NPS - focus on operational metrics. When using metrics to justify decisions, consider stating the underlying heuristic directly rather than obscuring intent through gameable metrics. Follow all constraints:\n${lines.join(
    "\n"
  )}`;
}

export interface UserPromptPayload {
  specText: string;
  structuredSpec?: SerializedWorkflowSpec;
  outlinePayload?: SerializedWorkflowOutline;
}

/**
 * Build user prompt containing structured and legacy spec inputs
 */
export function buildUserPrompt({
  specText,
  structuredSpec,
  outlinePayload,
}: UserPromptPayload): string {
  const sections: string[] = [];

  if (structuredSpec) {
    sections.push(
      `Inputs/structured_spec_json:\n${JSON.stringify(structuredSpec, null, 2)}`
    );
  }

  if (outlinePayload) {
    sections.push(
      `Inputs/outline_payload_json:\n${JSON.stringify(outlinePayload, null, 2)}`
    );
  }

  const enumerationSummary = formatOutlineEnumerationsForPrompt();
  sections.push(`Inputs/outline_enumerations:\n${enumerationSummary}`);

  sections.push(`Inputs/legacy_spec_text:\n${specText}`);

  return sections.join("\n\n");
}
