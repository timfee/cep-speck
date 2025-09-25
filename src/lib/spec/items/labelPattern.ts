import type { Issue, SpecPack } from '../types';

export const itemId = 'label-pattern';

export type Params = {
  pattern?: string; // Default: "# {n}. {title}"
  requireNumbers?: boolean;
};

export function toPrompt(params: Params, pack?: SpecPack): string {
  const pattern = params.pattern || pack?.composition?.labelPattern || "# {n}. {title}";
  const examplePattern = pattern.replace('{n}', '1').replace('{title}', 'Section Title');
  
  return `Use consistent section headers following this pattern: ${examplePattern}. Number sections sequentially starting from 1.`;
}

export async function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Promise<Issue[]> {
  const issues: Issue[] = [];
  const pattern = params.pattern || pack?.composition?.labelPattern || "# {n}. {title}";
  
  // Extract all headers from the draft
  const headerRegex = /^#+\s+(.*)$/gm;
  const headers = [];
  let match;
  
  while ((match = headerRegex.exec(draft)) !== null) {
    headers.push({
      text: match[1],
      level: match[0].match(/^#+/)[0].length,
      line: draft.substring(0, match.index).split('\n').length
    });
  }
  
  if (headers.length === 0) {
    issues.push({
      id: `${itemId}-no-headers`,
      itemId,
      severity: 'error',
      message: 'No section headers found',
      evidence: 'Document contains no markdown headers'
    });
    return issues;
  }
  
  // Check main sections (level 1 headers) follow the pattern
  const mainSections = headers.filter(h => h.level === 1);
  
  if (params.requireNumbers !== false) {
    const numberedPattern = /^\d+\.\s+/;
    const unnumberedSections = mainSections.filter(section => !numberedPattern.test(section.text));
    
    if (unnumberedSections.length > 0) {
      issues.push({
        id: `${itemId}-missing-numbers`,
        itemId,
        severity: 'error',
        message: `${unnumberedSections.length} main sections missing numbers`,
        evidence: `Sections: ${unnumberedSections.map(s => s.text).join(', ')}`
      });
    }
    
    // Check sequential numbering
    const numberedSections = mainSections.filter(section => numberedPattern.test(section.text));
    const numbers = numberedSections.map(section => {
      const match = section.text.match(/^(\d+)\./);
      return match ? parseInt(match[1], 10) : 0;
    });
    
    for (let i = 0; i < numbers.length; i++) {
      const expectedNumber = i + 1;
      if (numbers[i] !== expectedNumber) {
        issues.push({
          id: `${itemId}-wrong-sequence`,
          itemId,
          severity: 'error',
          message: `Section ${i + 1} numbered as ${numbers[i]}, expected ${expectedNumber}`,
          evidence: `Found: "${numberedSections[i].text}"`
        });
      }
    }
  }
  
  return issues;
}

export const itemModule = { itemId, toPrompt, validate };