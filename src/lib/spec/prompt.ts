import type { SpecPack } from './types';
import { buildSystemPrompt } from './validate';

export function createPromptWithValidation(
  userPrompt: string,
  specPack: SpecPack
): string {
  const systemConstraints = buildSystemPrompt(specPack);
  
  const fullPrompt = `As a senior product manager, create a comprehensive Product Requirements Document (PRD) for the following concept:

${userPrompt}

${systemConstraints}

Focus on:
- Clear business value and user needs
- Specific, measurable requirements 
- Realistic timelines and priorities  
- Enterprise-grade considerations for scalability and security
- Success metrics that align with business objectives

Provide actionable, detailed content that development teams can implement.`;

  return fullPrompt;
}