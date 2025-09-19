import { invokeItemValidate } from "./registry";

import type { Issue, SpecPack, ValidationReport } from "./types";

/**
 * Runs all validation items in two layers.
 * 1. Deterministic Layer (structure, linter): Runs first. If any `error`
 * is found, it "fails fast" and returns immediately.
 * 2. Semantic Layer (policy): Runs only if the deterministic layer passes.
 * These are often async, AI-based checks.
 */
export async function validateAll(
  draft: string,
  pack: SpecPack
): Promise<ValidationReport> {
  const issues: Issue[] = [];
  const coverage: Record<string, boolean> = {};

  const deterministicItems = pack.items.filter(
    (def) => def.kind === "structure" || def.kind === "linter"
  );
  const semanticItems = pack.items.filter((def) => def.kind === "policy");

  // Layer 1: Deterministic Pass (FAIL FAST)
  for (const def of deterministicItems) {
    const found = await invokeItemValidate(draft, def, pack);
    let hasError = false;
    for (const it of found) {
      if (it.severity === "error") hasError = true;
      issues.push(it);
    }
    coverage[def.id] = true;
    if (hasError) {
      // FAIL FAST: Don't run semantic checks if basic structure is broken
      return { ok: false, issues, coverage };
    }
  }

  // Layer 2: Semantic Pass (AI-based)
  for (const def of semanticItems) {
    const found = await invokeItemValidate(draft, def, pack);
    for (const it of found) {
      issues.push(it);
    }
    coverage[def.id] = true;
  }

  return { ok: issues.length === 0, issues, coverage };
}
