import type { SpecPack, Issue } from './types';
import { getItem } from './registry';
import './items'; // Ensure items are registered

export async function validateDraft(
  draft: string,
  specPack: SpecPack
): Promise<Issue[]> {
  const allIssues: Issue[] = [];
  
  // Sort items by priority (higher priority = run first)
  const sortedItems = [...specPack.items].sort((a, b) => b.priority - a.priority);
  
  // Run validation for each item
  for (const item of sortedItems) {
    const module = getItem(item.id);
    
    if (!module) {
      allIssues.push({
        id: `missing-module-${item.id}`,
        itemId: item.id,
        severity: 'error',
        message: `Validation module "${item.id}" not found`,
        evidence: `Spec item: ${item.id}`
      });
      continue;
    }
    
    try {
      const issues = await module.validate(draft, item.params, specPack);
      
      // Override severity if specified in spec pack
      const adjustedIssues = issues.map(issue => ({
        ...issue,
        severity: item.severity || issue.severity
      }));
      
      allIssues.push(...adjustedIssues);
    } catch (error) {
      allIssues.push({
        id: `validation-error-${item.id}`,
        itemId: item.id,
        severity: 'error',
        message: `Validation failed for "${item.id}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        evidence: `Module: ${item.id}`
      });
    }
  }
  
  return allIssues;
}

export function buildSystemPrompt(specPack: SpecPack): string {
  const promptParts: string[] = [];
  
  // Sort items by priority for prompt construction
  const sortedItems = [...specPack.items].sort((a, b) => b.priority - a.priority);
  
  promptParts.push('Follow these requirements when generating the PRD:');
  promptParts.push('');
  
  // Build prompts from each validation item
  for (const item of sortedItems) {
    const module = getItem(item.id);
    
    if (module) {
      try {
        const itemPrompt = module.toPrompt(item.params, specPack);
        if (itemPrompt.trim()) {
          promptParts.push(`- ${itemPrompt}`);
        }
      } catch (error) {
        // Skip problematic items in prompt generation
        console.warn(`Failed to generate prompt for item ${item.id}:`, error);
      }
    }
  }
  
  // Add composition guidelines if present
  if (specPack.composition) {
    promptParts.push('');
    promptParts.push('Document structure requirements:');
    
    if (specPack.composition.labelPattern) {
      promptParts.push(`- Use section headers following this pattern: ${specPack.composition.labelPattern.replace('{n}', 'N').replace('{title}', 'Section Title')}`);
    }
    
    if (specPack.composition.sectionCount) {
      promptParts.push(`- Include exactly ${specPack.composition.sectionCount} main sections`);
    }
  }
  
  // Add global constraints
  if (specPack.globals?.targetWordCount) {
    promptParts.push(`- Target approximately ${specPack.globals.targetWordCount} words total`);
  }
  
  return promptParts.join('\n');
}

export function hasBlockingIssues(issues: Issue[]): boolean {
  return issues.some(issue => issue.severity === 'error');
}