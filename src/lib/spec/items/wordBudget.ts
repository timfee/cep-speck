import type { Issue } from '../types';

export const itemId = 'word-budget';
export type Params = { target?: number; hardCap?: number };

export function toPrompt(params: Params): string {
  const target = params.target ?? 1400;
  const cap = params.hardCap ?? 1800;
  return `Target word count: ${target} words (hard cap: ${cap} words). Be concise and focused.`;
}

export function validate(draft: string, params: Params): Issue[] {
  const wordCount = draft.split(/\s+/).filter(word => word.length > 0).length;
  const target = params.target ?? 1400;
  const cap = params.hardCap ?? 1800;
  const issues: Issue[] = [];
  
  if (wordCount > cap) {
    issues.push({
      id: 'word-budget-exceeded',
      itemId,
      severity: 'error',
      message: `document has ${wordCount} words; exceeds hard cap of ${cap}`,
      evidence: String(wordCount),
    });
  } else if (wordCount > target) {
    issues.push({
      id: 'word-budget-over-target',
      itemId,
      severity: 'warn',
      message: `document has ${wordCount} words; exceeds target of ${target}`,
      evidence: String(wordCount),
    });
  }
  return issues;
}

export function heal(issues: Issue[], params: Params): string | null {
  if (!issues.length) return null;
  const target = params.target ?? 1400;
  return `Compress content to meet word budget of ${target} words. Focus on removing redundancy, tightening sentences, and condensing bullet points while preserving key information.`;
}
