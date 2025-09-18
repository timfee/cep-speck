import type { SpecPack, Issue } from '../types';

export const itemId = 'section-count';
export type Params = { exact?: number; min?: number; max?: number; headerRegex: string };

export function toPrompt(params: Params, _pack: SpecPack): string {
  const range = params.exact != null ? `exactly ${params.exact}` : `${params.min ?? '?'}..${params.max ?? '?'}`;
  return `Ensure the document has ${range} top-level sections; detect sections using headerRegex: ${params.headerRegex}`;
}

export function validate(draft: string, params: Params, _pack: SpecPack): Issue[] {
  const rx = new RegExp(params.headerRegex, 'gm');
  const matches = draft.match(rx) ?? [];
  const count = matches.length;
  const issues: Issue[] = [];
  const ok =
    (params.exact != null && count === params.exact) ||
    (params.exact == null &&
      (params.min == null || count >= params.min) &&
      (params.max == null || count <= params.max));
  if (!ok) {
    issues.push({
      id: 'section-count-mismatch',
      itemId,
      severity: 'error',
      message: `found ${count} sections; expected ${params.exact ?? `${params.min ?? 0}..${params.max ?? '∞'}`}`,
      evidence: String(count),
    });
  }
  return issues;
}

export function heal(issues: Issue[], params: Params, _pack: SpecPack): string | null {
  if (!issues.length) return null;
  const range = params.exact != null ? `exactly ${params.exact}` : `${params.min ?? '?'}..${params.max ?? '?'}`;
  return `Adjust the number of top-level sections to ${range}. Keep compliant sections; add or trim minimally. Maintain header pattern ${params.headerRegex}.`;
}
