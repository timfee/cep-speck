import type { Issue, SpecPack } from '../types';

export const itemId = 'competitor-research';

export type Params = {
  requireTldr?: boolean;
  requireCitations?: boolean;
  minCompetitors?: number;
};

export function toPrompt(params: Params, pack?: SpecPack): string {
  const minCompetitors = params.minCompetitors || 3;
  let prompt = `Include competitive research analysis with at least ${minCompetitors} key competitors. `;
  
  if (params.requireTldr) {
    prompt += 'Provide a TL;DR section summarizing competitive landscape. ';
  }
  
  if (params.requireCitations) {
    prompt += 'Include citations and sources for competitive claims. ';
  }
  
  return prompt + 'Focus on differentiation and market positioning.';
}

export async function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Promise<Issue[]> {
  const issues: Issue[] = [];
  const minCompetitors = params.minCompetitors || 3;
  
  // Check for competitive analysis section
  const hasCompetitiveSection = /competi(tor|tive)/i.test(draft);
  if (!hasCompetitiveSection) {
    issues.push({
      id: `${itemId}-missing-section`,
      itemId,
      severity: 'error',
      message: 'Missing competitive analysis section',
      evidence: 'No competitive research found'
    });
    return issues;
  }
  
  // Check for sufficient number of competitors mentioned
  const competitorPatterns = [
    /\b\w+\s+(Inc|Corp|Corporation|Ltd|LLC|Co)\b/g,
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b(?=\s+(?:offers|provides|has|is|was))/g
  ];
  
  const competitors = new Set<string>();
  competitorPatterns.forEach(pattern => {
    const matches = draft.match(pattern);
    if (matches) {
      matches.forEach(match => competitors.add(match.toLowerCase()));
    }
  });
  
  if (competitors.size < minCompetitors) {
    issues.push({
      id: `${itemId}-insufficient-competitors`,
      itemId,
      severity: 'warn',
      message: `Found only ${competitors.size} competitors, expected at least ${minCompetitors}`,
      evidence: `Competitors found: ${Array.from(competitors).join(', ')}`
    });
  }
  
  // Check for TL;DR if required
  if (params.requireTldr && !/tl;?dr/i.test(draft)) {
    issues.push({
      id: `${itemId}-missing-tldr`,
      itemId,
      severity: 'warn',
      message: 'Missing TL;DR summary of competitive landscape',
      evidence: 'No TL;DR section found'
    });
  }
  
  // Check for citations if required
  if (params.requireCitations && !draft.match(/\[(.*?)\]|\((.*?)\)|Source:|Reference:/i)) {
    issues.push({
      id: `${itemId}-missing-citations`,
      itemId,
      severity: 'warn',
      message: 'Missing citations or sources for competitive claims',
      evidence: 'No citations found'
    });
  }
  
  return issues;
}

export const itemModule = { itemId, toPrompt, validate };