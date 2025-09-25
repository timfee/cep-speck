import type { Issue, SpecPack } from '../types';

export const itemId = 'section-count';

export type Params = {
  exactCount?: number;
  minCount?: number;
  maxCount?: number;
};

export function toPrompt(params: Params, pack?: SpecPack): string {
  const exactCount = params.exactCount || pack?.composition?.sectionCount;
  
  if (exactCount) {
    return `Structure the document with exactly ${exactCount} main sections. Each section should be a top-level heading (# Title).`;
  }
  
  if (params.minCount && params.maxCount) {
    return `Structure the document with ${params.minCount}-${params.maxCount} main sections.`;
  }
  
  if (params.minCount) {
    return `Structure the document with at least ${params.minCount} main sections.`;
  }
  
  if (params.maxCount) {
    return `Structure the document with at most ${params.maxCount} main sections.`;
  }
  
  return 'Structure the document with well-organized main sections.';
}

export async function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Promise<Issue[]> {
  const issues: Issue[] = [];
  const exactCount = params.exactCount || pack?.composition?.sectionCount;
  const minCount = params.minCount;
  const maxCount = params.maxCount;
  
  // Count main sections (level 1 headers)
  const mainSectionRegex = /^#\s+(.+)$/gm;
  const mainSections = [];
  let match;
  
  while ((match = mainSectionRegex.exec(draft)) !== null) {
    mainSections.push(match[1].trim());
  }
  
  const actualCount = mainSections.length;
  
  if (exactCount && actualCount !== exactCount) {
    issues.push({
      id: `${itemId}-wrong-count`,
      itemId,
      severity: 'error',
      message: `Document has ${actualCount} sections, expected exactly ${exactCount}`,
      evidence: `Sections: ${mainSections.join(', ')}`
    });
  } else {
    if (minCount && actualCount < minCount) {
      issues.push({
        id: `${itemId}-too-few`,
        itemId,
        severity: 'error',
        message: `Document has ${actualCount} sections, expected at least ${minCount}`,
        evidence: `Sections: ${mainSections.join(', ')}`
      });
    }
    
    if (maxCount && actualCount > maxCount) {
      issues.push({
        id: `${itemId}-too-many`,
        itemId,
        severity: 'error',
        message: `Document has ${actualCount} sections, expected at most ${maxCount}`,
        evidence: `Sections: ${mainSections.join(', ')}`
      });
    }
  }
  
  // Check for empty sections
  if (actualCount > 0) {
    const sections = draft.split(/^#\s+/m).slice(1); // Remove content before first header
    sections.forEach((section, index) => {
      const content = section.split(/^#+\s+/m)[0].trim(); // Get content before next header
      const actualContent = content.replace(/^.*$/m, '').trim(); // Remove the title line
      
      if (actualContent.length < 50) { // Minimum content threshold
        issues.push({
          id: `${itemId}-empty-section-${index + 1}`,
          itemId,
          severity: 'warn',
          message: `Section "${mainSections[index]}" appears to be empty or too short`,
          evidence: `Content: "${actualContent}"`
        });
      }
    });
  }
  
  return issues;
}

export const itemModule = { itemId, toPrompt, validate };