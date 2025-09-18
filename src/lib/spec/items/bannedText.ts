import type { SpecPack, Issue } from '../types';

export const itemId = 'banned-text';
export type Params = { listsFromPack?: boolean; extra?: { exact?: string[]; regex?: string[] } };

function collectExact(params: Params, pack: SpecPack): string[] {
  return [
    ...(params.extra?.exact ?? []),
    ...(params.listsFromPack ? (pack.globals?.bannedText?.exact ?? []) : []),
  ];
}
function collectRegex(params: Params, pack: SpecPack): string[] {
  return [
    ...(params.extra?.regex ?? []),
    ...(params.listsFromPack ? (pack.globals?.bannedText?.regex ?? []) : []),
  ];
}

export function toPrompt(params: Params, pack: SpecPack): string {
  const exact = collectExact(params, pack);
  const regex = collectRegex(params, pack);
  return `Avoid banned terms. Exact: ${exact.join(', ')}. Regex: ${regex.join(' | ')}.`;
}

export function validate(draft: string, params: Params, pack: SpecPack): Issue[] {
  const exact = collectExact(params, pack);
  const regex = collectRegex(params, pack);
  const issues: Issue[] = [];
  for (const word of exact) {
    if (!word) continue;
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i');
    if (re.test(draft)) {
      issues.push({ id: 'banned-exact', itemId, severity: 'error', message: `contains banned term "${word}"` });
    }
  }
  for (const pattern of regex) {
    if (!pattern) continue;
    const re = new RegExp(pattern, 'g');
    if (re.test(draft)) {
      issues.push({ id: 'banned-regex', itemId, severity: 'error', message: `matches banned pattern ${pattern}` });
    }
  }
  return issues;
}

export function heal(issues: Issue[]): string | null {
  if (!issues.length) return null;
  return `Replace banned terms with precise CEP/Admin Console terminology appropriate to context.`;
}
