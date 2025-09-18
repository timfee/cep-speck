import type { Issue } from '../types';

export const itemId = 'competitor-research';
export type Params = { 
  vendors: string[];
  recencyDays: number;
  requireResearch: boolean;
};

export function toPrompt(params: Params): string {
  const vendors = params.vendors.join(', ');
  return `Perform competitor research on: ${vendors}. Include a brief competitive snapshot in the TL;DR section. Research onboarding defaults, policy templates, enterprise browser posture, data protection capabilities, and mobile support. Use sources from the last ${params.recencyDays} days.`;
}

export function validate(draft: string, params: Params): Issue[] {
  const issues: Issue[] = [];
  
  if (params.requireResearch) {
    const tldrMatch = draft.match(/# 1\. TL;DR[\s\S]*?(?=# 2\.|$)/i);
    if (tldrMatch) {
      const tldrContent = tldrMatch[0];
      const hasCompetitiveSnapshot = /competitive snapshot|competitor|enterprise browser|policy template/i.test(tldrContent);
      
      if (!hasCompetitiveSnapshot) {
        issues.push({
          id: 'missing-competitive-research',
          itemId,
          severity: 'error',
          message: 'TL;DR section missing competitive snapshot',
          evidence: 'No competitive analysis found in TL;DR'
        });
      }
    }
    
    const hasFootnotes = /footnotes|references/i.test(draft);
    if (!hasFootnotes) {
      issues.push({
        id: 'missing-research-citations',
        itemId,
        severity: 'warn',
        message: 'Missing research citations in footnotes',
        evidence: 'No footnotes section found'
      });
    }
  }
  
  return issues;
}

export function heal(issues: Issue[], params: Params): string | null {
  if (!issues.length) return null;
  
  const vendors = params.vendors.join(', ');
  return `Research and integrate competitive information about ${vendors} into the TL;DR section. Focus on onboarding defaults, policy templates, enterprise browser capabilities, and data protection features. Add citations as numbered footnotes after the Annexes section.`;
}
