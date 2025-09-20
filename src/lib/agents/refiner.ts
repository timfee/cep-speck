import type { CoreMessage, StreamTextResult } from 'ai';

import { getResilientAI } from '@/lib/ai/resilient';

import type { EvaluationIssue } from './types';
import { loadPrompt } from './utils';

/**
 * Refiner Agent: Fix issues in PRD draft based on evaluation report
 */
export async function runRefinerAgent(
  draft: string,
  issues: EvaluationIssue[]
): Promise<StreamTextResult<Record<string, never>, never>> {
  try {
    // Load prompt template
    const systemPrompt = await loadPrompt('refiner');
    
    // Format issues for the prompt
    const issuesText = JSON.stringify(issues, null, 2);
    
    // Build contextual messages
    const messages: CoreMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Full Draft:\n\n${draft}\n\nIssues to Fix:\n\n${issuesText}` 
      },
    ];
    
    // Get AI instance and stream response
    const ai = getResilientAI();
    return await ai.generateWithFallback(messages);
    
  } catch (error) {
    console.error('Refiner agent failed:', error);
    throw new Error('Failed to refine draft');
  }
}