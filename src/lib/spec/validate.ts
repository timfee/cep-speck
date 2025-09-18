import type { SpecPack, ValidationReport, Issue } from './types';
import { getItem } from './registry';

export interface ValidateOptions {
  failFast?: boolean; // stop after first item producing an error-level issue
}

export function validateAll(draft: string, pack: SpecPack, opts: ValidateOptions = {}): ValidationReport {
  const issues: Issue[] = [];
  const coverage: Record<string, boolean> = {};
  const failFast = opts.failFast || process.env.SPEC_FAIL_FAST === '1';
  for (const def of pack.items) {
    const mod = getItem(def.id);
    const found = (mod.validate(draft, def.params as unknown, pack) || []) as Issue[];
    let hasError = false;
    for (const it of found) {
      if (!it.severity) it.severity = def.severity;
      if (it.severity === 'error') hasError = true;
    }
    coverage[def.id] = true;
    issues.push(...found);
    if (failFast && hasError) {
      break;
    }
  }
  return { ok: issues.length === 0, issues, coverage };
}
