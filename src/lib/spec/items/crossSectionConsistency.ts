import type { Issue } from '../types';

export const itemId = 'cross-section-consistency';
export type Params = { metricRegex?: string };

function extractMetrics(block: string, params: Params): Map<string, string> {
  // Extract metrics using pattern: - <metric>: <value> or * <metric>: <value>
  // The ([^#].*) pattern captures values up to a # character to handle inline comments
  const map = new Map<string, string>();
  const defaultPattern = /^[-*]\s+([^:]+):\s+([^#].*)$/;
  const customPattern = params.metricRegex ? new RegExp(params.metricRegex) : null;
  
  for (const line of block.split('\n')) {
    if (customPattern) {
      // Use custom regex if provided
      const matches = line.match(customPattern);
      if (matches && matches.length >= 3) {
        const key = matches[1]?.trim().toLowerCase();
        const value = matches[2]?.trim();
        if (key && value) {
          map.set(key, value);
        }
      }
    } else {
      // Use default pattern
      const m = line.match(defaultPattern);
      if (m) map.set(m[1].trim().toLowerCase(), m[2].trim());
    }
  }
  return map;
}

export function toPrompt(): string {
  return 'Metrics in TL;DR must exactly match values in Success Metrics section.';
}

export function validate(draft: string, params: Params): Issue[] {
  const issues: Issue[] = [];
  const tldr = draft.match(/# 1\. TL;DR[\s\S]*?(?=# \d+\.|$)/)?.[0] || '';
  const success = draft.match(/# 8\. Success Metrics[\s\S]*?(?=# \d+\.|$)/)?.[0] || '';
  const a = extractMetrics(tldr, params);
  const b = extractMetrics(success, params);
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