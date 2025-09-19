import { invokeItemValidate } from "./registry";

import type { Issue, SpecPack, ValidationReport } from "./types";

export function validateAll(draft: string, pack: SpecPack): ValidationReport {
  const issues: Issue[] = [];
  const coverage: Record<string, boolean> = {};
  const failFast = true; // Always fail-fast deterministically

  for (const def of pack.items) {
    const found = invokeItemValidate(draft, def, pack);
    let hasError = false;
    for (const it of found) {
      // Ensure severity is set (defensive programming for validation modules)
      (it as any).severity = it.severity ?? def.severity;
      if (it.severity === "error") hasError = true;
    }
    coverage[def.id] = true;
    issues.push(...found);
    if (failFast && hasError) {
      break;
    }
  }
  return { ok: issues.length === 0, issues, coverage };
}
