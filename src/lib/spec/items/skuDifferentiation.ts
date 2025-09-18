import type { Issue } from '../types';

export const itemId = 'sku-differentiation';
export type Params = { 
  targetSku: string;
  sectionPattern?: string;
  featurePattern?: string;
  justificationPatterns?: string[];
};

// Default patterns that can be overridden via params
const DEFAULT_SECTION_PATTERN = /# \d+\. Functional Requirements[\s\S]*?(?=# \d+\.|$)/;
const DEFAULT_FEATURE_PATTERN = /## F\d+ —/;

// Justification patterns broken down for better maintainability
const JUSTIFICATION_PATTERNS = [
  /premium.*(?:differentiator|value|offering|tier|sku)/i,
  /upgrade.*premium/i,
  /core.*limitation/i,
  /enables.*premium/i,
  /foundation.*premium/i,
  /premium.*justification/i,
  /rationale.*premium/i
];

export function toPrompt(params: Params): string {
  const sectionDesc = params.sectionPattern ? 'the configured requirements section' : 'Functional Requirements section';
  return `Each feature in ${sectionDesc} must state Target SKU (Core | Premium | Both) and premium differentiation rationale. Target SKU for this PRD: ${params.targetSku}.`;
}

export function validate(draft: string, params: Params): Issue[] {
  const issues: Issue[] = [];
  
  // Use configurable section pattern or default
  const sectionPattern = params.sectionPattern 
    ? new RegExp(params.sectionPattern) 
    : DEFAULT_SECTION_PATTERN;
  
  // Extract the requirements section using configurable pattern
  const section = draft.match(sectionPattern)?.[0] || '';
  
  if (!section) {
    // If no section found, that's likely a document structure issue
    return issues;
  }
  
  // Use configurable feature pattern or default
  const featurePattern = params.featurePattern 
    ? new RegExp(params.featurePattern) 
    : DEFAULT_FEATURE_PATTERN;
  
  // Split by feature headings and skip the first empty element
  const blocks = section.split(featurePattern).slice(1);
  
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
      const hasJustification = checkJustification(trimmed, params.justificationPatterns);
      if (!hasJustification) {
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

function checkJustification(text: string, customPatterns?: string[]): boolean {
  // Use custom patterns if provided, otherwise use defaults
  const patterns = customPatterns?.map(p => new RegExp(p, 'i')) || JUSTIFICATION_PATTERNS;
  
  return patterns.some(pattern => pattern.test(text));
}

export function heal(): string | null {
  return null;
}