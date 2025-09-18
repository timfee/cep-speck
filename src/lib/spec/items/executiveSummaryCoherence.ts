import type { Issue } from '../types';

export const itemId = 'executive-summary-coherence';
export type Params = Record<string, never>;

export function toPrompt(): string {
  return 'TL;DR must highlight at least half of the core feature set.';
}

export function validate(draft: string, _params: Params): Issue[] {
  const issues: Issue[] = [];
  
  // Extract TL;DR section
  const tldr = draft.match(/# 1\. TL;DR[\s\S]*?(?=# 2\.|$)/)?.[0] || '';
  
  // Extract Functional Requirements section  
  const featuresBlock = draft.match(/# 6\. Functional Requirements[\s\S]*?(?=# 7\.|$)/)?.[0] || '';
  
  // Extract feature names using pattern ## F\d+ — <Name>
  const names = [...featuresBlock.matchAll(/## F\d+ — ([^\n]+)/g)].map(m => m[1]);
  
  if (!names.length) {
    return issues;
  }
  
  // Count how many feature names appear in TL;DR (case-insensitive)
  let mentioned = 0;
  const lowTLDR = tldr.toLowerCase();
  
  for (const name of names) {
    if (lowTLDR.includes(name.toLowerCase())) {
      mentioned++;
    }
  }
  
  // Check if less than 50% of features are mentioned
  if (mentioned < names.length / 2) {
    issues.push({
      id: 'tldr-feature-mismatch',
      itemId,
      severity: 'warn',
      message: `TL;DR mentions only ${mentioned}/${names.length} core features`,
      evidence: `Found features: ${names.join(', ')}; TL;DR coverage: ${Math.round((mentioned / names.length) * 100)}%`
    });
  }
  
  return issues;
}

export function heal(): string | null {
  return null;
}