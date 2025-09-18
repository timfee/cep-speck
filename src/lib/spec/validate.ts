import { getItem } from "./registry";
import type { Issue, SpecPack, ValidationReport } from "./types";

export function validateAll(draft: string, pack: SpecPack): ValidationReport {
  const issues: Issue[] = [];
  const coverage: Record<string, boolean> = {};
  const failFast = true; // Always fail-fast deterministically
  for (const def of pack.items) {
    const mod = getItem(def.id);
    const found = (mod.validate(draft, def.params as unknown, pack) ||
      []) as Issue[];
    let hasError = false;
    for (const it of found) {
      if (!it.severity) it.severity = def.severity;
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
