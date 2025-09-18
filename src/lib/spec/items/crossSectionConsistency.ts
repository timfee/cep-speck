import type { Issue } from '../types';

export const itemId = 'cross-section-consistency';
export type Params = { metricRegex?: string };

function extractMetrics(block: string): Map<string, string> {
  // Simple heuristic: lines like - <metric>: <value>
  const map = new Map<string, string>();
  for (const line of block.split('\n')) {
    const m = line.match(/^[-*]\s+([^:]+):\s+([^#].*)$/);
    if (m) map.set(m[1].trim().toLowerCase(), m[2].trim());
  }
  return map;
}

export function toPrompt(): string {
  return 'Metrics in TL;DR must exactly match values in Success Metrics section.';
}

export function validate(draft: string): Issue[] {
  const issues: Issue[] = [];
  const tldr = draft.match(/# 1\. TL;DR[\s\S]*?(?=# \d+\.|$)/)?.[0] || '';
  const success = draft.match(/# 8\. Success Metrics[\s\S]*?(?=# \d+\.|$)/)?.[0] || '';
  const a = extractMetrics(tldr);
  const b = extractMetrics(success);
  for (const [k, v] of a) {
    if (b.has(k) && b.get(k) !== v) {
      issues.push({
        id: 'metric-inconsistency',
        itemId,
        severity: 'error',
        message: `Conflicting metrics: "${k}" is ${v} in TL;DR but ${b.get(k)} in Success Metrics`,
        evidence: `${k}: ${v} | ${b.get(k)}`
      });
    }
  }
  return issues;
}

export function heal(): string | null { 
  return null; 
}