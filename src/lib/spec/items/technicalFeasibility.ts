import type { Issue } from '../types';

export const itemId = 'technical-feasibility';
export type Params = Record<string, never>;

export function toPrompt(): string {
  return 'Reject impossible percentages (>100%) and flag unrealistic rapid adoption claims.';
}

export function validate(draft: string): Issue[] {
  const issues: Issue[] = [];
  
  // Check for impossible percentages (>100%)
  const percentagePattern = /(\d+(?:\.\d+)?)\s*%/g;
  let match: RegExpExecArray | null;
  
  while ((match = percentagePattern.exec(draft)) !== null) {
    const value = parseFloat(match[1]);
    if (value > 100) {
      issues.push({
        id: 'impossible-percentage',
        itemId,
        severity: 'error',
        message: `Impossible percentage: ${value}%`,
        evidence: match[0]
      });
    } else if (value === 100) {
      issues.push({
        id: 'absolute-percentage',
        itemId,
        severity: 'warn',
        message: 'Avoid claiming 100% outcomes for human behavior',
        evidence: match[0]
      });
    }
  }
  
  // Check for unrealistic adoption claims
  const adoptionClaims = draft.match(/(\d+)\s*%.*?(adoption|activation|migration).*?(within|in)\s+(\d+)\s*(day|week|month)/gi) || [];
  
  for (const claim of adoptionClaims) {
    const numbers = claim.match(/\d+/g);
    if (!numbers) continue;
    
    const percentageValue = parseInt(numbers[0], 10);
    const timeValue = parseInt(numbers[1], 10);
    
    // Convert time to days for comparison
    let timeInDays = timeValue;
    if (claim.toLowerCase().includes('week')) {
      timeInDays = timeValue * 7;
    } else if (claim.toLowerCase().includes('month')) {
      timeInDays = timeValue * 30;
    }
    
    if (percentageValue > 80 && timeInDays < 30) {
      issues.push({
        id: 'unrealistic-adoption',
        itemId,
        severity: 'warn',
        message: 'Potentially unrealistic adoption timeline',
        evidence: claim
      });
    }
  }
  
  return issues;
}

export function heal(): string | null {
  return null;
}