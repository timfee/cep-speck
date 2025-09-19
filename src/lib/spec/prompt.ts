import { CRITICAL_VALIDATION_REQUIREMENTS } from "./config/criticalValidationRules";
import { invokeItemToPrompt } from "./registry";

import type { SpecPack } from "./types";

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
  )}${CRITICAL_VALIDATION_REQUIREMENTS}`;
}

export function buildUserPrompt(specText: string): string {
  return `Inputs/spec:\n${specText}`;
}
