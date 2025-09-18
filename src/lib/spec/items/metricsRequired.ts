import type { Issue } from '../types';

export const itemId = 'metrics-required';
export type Params = { require: ('units'|'timeframe'|'SoT')[]; metricRegex: string };

export function toPrompt(params: Params): string {
  return `Every metric must include: ${params.require.join(', ')}. Identify metric lines by regex: ${params.metricRegex}`;
}

export function validate(draft: string, params: Params): Issue[] {
  const rx = new RegExp(params.metricRegex, 'gm');
  const metricLines = draft.split('\n').filter(l => rx.test(l));
  const issues: Issue[] = [];
  for (const line of metricLines) {
    const missing: string[] = [];
    if (params.require.includes('timeframe') && !/\b(within|by)\b/i.test(line)) missing.push('timeframe');
    if (params.require.includes('units') && !/%|\bms\b|\bminutes?\b|\bdays?\b|\bcount\b/.test(line)) missing.push('units');
    if (params.require.includes('SoT') && !/\b(SoT|Source of Truth|CBCM|Reporting Connector|Admin Console)\b/.test(line)) missing.push('SoT');
    if (missing.length) {
      issues.push({
        id: 'metrics-missing-attrs',
        itemId,
        severity: 'error',
        message: `metric missing: ${missing.join(', ')}`,
        evidence: line,
        hints: missing.map(m => `missing:${m}`),
      });
    }
  }
  return issues;
}

export function heal(issues: Issue[], params: Params): string | null {
  if (!issues.length) return null;
  const req = params.require.join(', ');
  return `For each metric line (pattern ${params.metricRegex}), add the missing attributes: ${req}. Use timeframe like "within 90 days of GA", explicit units, and name a Source of Truth (SoT). Do not rewrite unrelated content.`;
}
