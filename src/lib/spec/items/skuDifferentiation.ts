import type { Issue } from '../types';

export const itemId = 'sku-differentiation';
export type Params = { targetSku: string };

export function toPrompt(params: Params): string {
  return `Each feature must state Target SKU (Core | Premium | Both) and premium differentiation rationale. Target SKU for this PRD: ${params.targetSku}.`;
}

export function validate(draft: string, params: Params): Issue[] {
  const issues: Issue[] = [];
  
  // Extract section "# 6. Functional Requirements"
  const section = draft.match(/# 6\. Functional Requirements[\s\S]*?(?=# 7\.|$)/)?.[0] || '';
  
  // Split by "## F\d+ —" headings and skip the first empty element
  const blocks = section.split(/## F\d+ —/).slice(1);
  
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    
    // Check for missing SKU specification
    if (!trimmed.includes('**Target SKU:**')) {
      issues.push({
        id: 'missing-sku-specification',
        itemId,
        severity: 'error',
        message: 'Feature missing SKU specification'
      });
      continue;
    }
    
    // Check for unclear SKU differentiation in premium PRDs
    if (params.targetSku === 'premium' && /\*\*Target SKU:\*\* Core/i.test(trimmed)) {
      const justification = /(premium.*(?:differentiator|value|offering|tier|sku)|upgrade.*premium|core.*limitation|enables.*premium|foundation.*premium)/i.test(trimmed);
      if (!justification) {
        issues.push({
          id: 'unclear-sku-differentiation',
          itemId,
          severity: 'warn',
          message: 'Core feature in Premium PRD lacks differentiation explanation'
        });
      }
    }
  }
  
  return issues;
}

export function heal(): string | null {
  return null;
}