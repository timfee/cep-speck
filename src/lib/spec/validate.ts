import type { SpecPack, ValidationReport, Issue } from './types';
import { getItem } from './registry';

export function validateAll(draft: string, pack: SpecPack): ValidationReport {
  const issues: Issue[] = [];
  const coverage: Record<string, boolean> = {};
  for (const def of pack.items) {
    const mod = getItem(def.id);
    const found = mod.validate(draft, def.params as unknown, pack) || [];
    for (const it of found) {
      if (!it.severity) it.severity = def.severity;
    }
    coverage[def.id] = true;
    issues.push(...found);
  }
  return { ok: issues.length === 0, issues, coverage };
}
