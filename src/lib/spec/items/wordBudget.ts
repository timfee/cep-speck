import type { Issue, SpecPack } from '../types';

export const itemId = 'word-budget';

export type Params = {
  maxWords: number;
  warningThreshold?: number; // Percentage of max (e.g., 0.8 for 80%)
};

export function toPrompt(params: Params, pack?: SpecPack): string {
  const maxWords = params.maxWords;
  const warningThreshold = Math.round(maxWords * (params.warningThreshold || 0.8));
  
  return `Keep the document under ${maxWords} words. Aim for ${warningThreshold} words or less for optimal readability. Be concise and impactful.`;
}

export async function validate(
  draft: string, 
  params: Params, 
  pack?: SpecPack
): Promise<Issue[]> {
  const issues: Issue[] = [];
  
  // Simple word count (split by whitespace and filter non-empty)
  const words = draft.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  const maxWords = params.maxWords;
  const warningThreshold = Math.round(maxWords * (params.warningThreshold || 0.8));
  
  if (wordCount > maxWords) {
    issues.push({
      id: `${itemId}-exceeded`,
      itemId,
      severity: 'error',
      message: `Document is ${wordCount} words, which exceeds the ${maxWords} word limit by ${wordCount - maxWords} words.`,
      evidence: `Word count: ${wordCount}/${maxWords}`,
    });
  } else if (wordCount > warningThreshold) {
    issues.push({
      id: `${itemId}-warning`,
      itemId,
      severity: 'warn',
      message: `Document is ${wordCount} words, approaching the ${maxWords} word limit. Consider being more concise.`,
      evidence: `Word count: ${wordCount}/${maxWords}`,
    });
  }
  
  return issues;
}

export const itemModule = { itemId, toPrompt, validate };