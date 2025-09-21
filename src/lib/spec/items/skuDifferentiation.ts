import type { Issue } from "../types";

export const itemId = "sku-differentiation";
export type Params = { targetSku: string };

function toPrompt(_params: Params, _pack?: unknown): string {
  return "Each feature must state Target SKU (Core | Premium | Both) and premium differentiation rationale.";
}

async function validate(
  draft: string,
  params: Params,
  _pack?: unknown
): Promise<Issue[]> {
  const issues: Issue[] = [];
  const section =
    draft.match(/# 6\. Functional Requirements[\s\S]*?(?=# 7\.|$)/)?.[0] ?? "";
  const blocks = section.split(/## F\d+ —/).slice(1);
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    if (!block.includes("**Target SKU:**")) {
      issues.push({
        id: "missing-sku-specification",
        itemId,
        severity: "error",
        message: "Feature missing SKU specification",
      });
      continue;
    }
    if (
      params.targetSku === "premium" &&
      /\*\*Target SKU:\*\* Core/i.test(block)
    ) {
      const justification =
        /(premium.*differentiator|upgrade.*premium|core.*limitation|path to premium)/i.test(
          block
        );
      if (!justification) {
        issues.push({
          id: "unclear-sku-differentiation",
          itemId,
          severity: "warn",
          message:
            "Core feature in Premium PRD lacks differentiation explanation",
        });
      }
    }
  }
  return issues;
}

export const itemModule = { itemId, toPrompt, validate };
