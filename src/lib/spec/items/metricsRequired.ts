import type { Issue } from '../types';

export const itemId = 'metrics-required';
export type Params = { require: ('units'|'timeframe'|'SoT')[]; metricRegex: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toPrompt(params: Params, _pack?: unknown): string {
  return `Every metric must include: ${params.require.join(', ')}. Identify metric lines by regex: ${params.metricRegex}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validate(draft: string, params: Params, _pack?: unknown): Issue[] {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function heal(issues: Issue[], params: Params, _pack?: unknown): string | null {
  if (!issues.length) return null;
  const req = params.require.join(', ');
  return `For each metric line (pattern ${params.metricRegex}), add the missing attributes: ${req}. Use timeframe like "within 90 days of GA", explicit units, and name a Source of Truth (SoT). Do not rewrite unrelated content.`;
}

export const itemModule = { itemId, toPrompt, validate, heal };
