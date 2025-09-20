import { z } from 'zod';

import { getResilientAI } from '@/lib/ai/resilient';

import type { EvaluationIssue } from './types';
import { loadPrompt, loadStyleGuide } from './utils';

// Zod schema for evaluation issue validation
const EvaluationIssueSchema = z.object({
  section: z.string(),
  issue: z.string(),
  evidence: z.string(),
  suggestion: z.string(),
});

const EvaluationResultSchema = z.array(EvaluationIssueSchema);

/**
 * Evaluator Agent: Find issues in PRD draft based on style guide
 */
export async function runEvaluatorAgent(draft: string): Promise<EvaluationIssue[]> {
  try {
    // Load prompt template and style guide
    const systemPrompt = await loadPrompt('evaluator');
    const styleGuide = await loadStyleGuide();
    
    // Combine prompts
    const fullSystemPrompt = `${systemPrompt}\n\nStyle & Principles Guide:\n${styleGuide}`;
    
    // Get AI instance
    const ai = getResilientAI();
    
    // Generate evaluation using generateObject for JSON output
    const result = await ai.generateObjectWithFallback({
      prompt: `${fullSystemPrompt}\n\nPRD Draft to Evaluate:\n\n${draft}`,
      schema: EvaluationResultSchema,
    });
    
    return result.object;
  } catch (error) {
    console.error('Evaluator agent failed:', error);
    throw new Error('Failed to evaluate draft');
  }
}