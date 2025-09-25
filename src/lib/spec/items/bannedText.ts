import type { Issue, SpecPack } from '../types';

export const itemId = 'banned-text';

export type Params = {
  exactMatches?: string[];
  regexPatterns?: string[];
  caseSensitive?: boolean;
};

export function toPrompt(params: Params, pack?: SpecPack): string {
  const bannedExact = params.exactMatches || pack?.globals?.bannedText?.exact || [];
  const bannedRegex = params.regexPatterns || pack?.globals?.bannedText?.regex || [];
  
  let prompt = '';
  
  if (bannedExact.length > 0) {
    prompt += `Avoid using these specific terms: ${bannedExact.join(', ')}. `;
  }
  
  if (bannedRegex.length > 0) {
    prompt += `Avoid text patterns that match these expressions: ${bannedRegex.join(', ')}. `;
  }
  
  if (prompt) {
    prompt += 'Use professional, precise language instead of buzzwords or vague terms.';
  }
  
  return prompt;
}

export async function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Promise<Issue[]> {
  const issues: Issue[] = [];
  
  const exactMatches = params.exactMatches || pack?.globals?.bannedText?.exact || [];
  const regexPatterns = params.regexPatterns || pack?.globals?.bannedText?.regex || [];
  const caseSensitive = params.caseSensitive ?? false;
  
  const searchText = caseSensitive ? draft : draft.toLowerCase();
  
  // Check exact matches
  for (const banned of exactMatches) {
    const searchBanned = caseSensitive ? banned : banned.toLowerCase();
    
    if (searchText.includes(searchBanned)) {
      const regex = new RegExp(caseSensitive ? banned : banned, caseSensitive ? 'g' : 'gi');
      const matches = draft.match(regex);
      
      issues.push({
        id: `${itemId}-exact-${banned.replace(/\s+/g, '-')}`,
        itemId,
        severity: 'error',
        message: `Contains banned term: "${banned}". Found ${matches?.length || 1} occurrence(s).`,
        evidence: matches?.[0] || banned
      });
    }
  }
  
  // Check regex patterns
  for (const pattern of regexPatterns) {
    try {
      const regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
      const matches = draft.match(regex);
      
      if (matches && matches.length > 0) {
        issues.push({
          id: `${itemId}-regex-${pattern.slice(0, 10)}`,
          itemId,
          severity: 'warn',
          message: `Contains text matching banned pattern: ${pattern}. Found ${matches.length} occurrence(s).`,
          evidence: matches[0]
        });
      }
    } catch (error) {
      // Invalid regex pattern
      issues.push({
        id: `${itemId}-invalid-regex`,
        itemId,
        severity: 'error',
        message: `Invalid regex pattern: ${pattern}`,
        evidence: pattern
      });
    }
  }
  
  return issues;
}

export const itemModule = { itemId, toPrompt, validate };