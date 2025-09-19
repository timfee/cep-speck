import type { Issue } from "../types";

import { WORD_BUDGET } from "@/lib/constants";

export const itemId = "word-budget";
export type Params = { target?: number; hardCap?: number };

 
function toPrompt(params: Params, _pack?: unknown): string {
  const target = params.target ?? WORD_BUDGET.MINIMUM_BUDGET;
  const cap = params.hardCap ?? WORD_BUDGET.TARGET_BUDGET;
  return `Target word count: ${target} words (hard cap: ${cap} words). Be concise and focused.`;
}

 
function validate(draft: string, params: Params, _pack?: unknown): Issue[] {
  const wordCount = draft.split(/\s+/).filter((word) => word.length > 0).length;
  const target = params.target ?? WORD_BUDGET.MINIMUM_BUDGET;
  const cap = params.hardCap ?? WORD_BUDGET.TARGET_BUDGET;
  const issues: Issue[] = [];

  if (wordCount > cap) {
    issues.push({
      id: "word-budget-exceeded",
      itemId,
      severity: "error",
      message: `document has ${wordCount} words; exceeds hard cap of ${cap}`,
      evidence: String(wordCount),
    });
  } else if (wordCount > target) {
    issues.push({
      id: "word-budget-over-target",
      itemId,
      severity: "warn",
      message: `document has ${wordCount} words; exceeds target of ${target}`,
      evidence: String(wordCount),
    });
  }
  return issues;
}

 
function heal(issues: Issue[], params: Params, _pack?: unknown): string | null {
  if (!issues.length) return null;
  const target = params.target ?? WORD_BUDGET.MINIMUM_BUDGET;
  return `Compress content to meet word budget of ${target} words. Focus on removing redundancy, tightening sentences, and condensing bullet points while preserving key information.`;
}

export const itemModule = { itemId, toPrompt, validate, heal };
