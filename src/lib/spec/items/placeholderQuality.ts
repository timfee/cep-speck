import type { Issue } from '../types';

export const itemId = 'placeholder-quality';
export type Params = Record<string, never>;

export function toPrompt(): string {
  return 'Placeholders must be specific: include data, units, timeframe, and source.';
}

export function validate(draft: string): Issue[] {
  const issues: Issue[] = [];
  const placeholders = draft.match(/\[PM_INPUT_NEEDED:[^\]]+\]/g) || [];
  
  for (const ph of placeholders) {
    const content = ph.match(/\[PM_INPUT_NEEDED:\s*([^\]]+)\]/)?.[1] || '';
    
    // Check for vague placeholders (< 3 words)
    if (content.trim().split(/\s+/).length < 3) {
      issues.push({
        id: 'vague-placeholder',
        itemId,
        severity: 'warn',
        message: `Placeholder too vague: "${ph}"`,
        evidence: ph
      });
    }
    
    // Check for metric placeholders missing units
    if (/(baseline|target|metric)/i.test(content) && !/(minutes|hours|days|%|count|users)/i.test(content)) {
      issues.push({
        id: 'placeholder-missing-units',
        itemId,
        severity: 'error',
        message: `Metric placeholder missing units: "${ph}"`,
        evidence: ph
      });
    }
  }
  
  return issues;
}

export function heal(): string | null {
  return null;
}