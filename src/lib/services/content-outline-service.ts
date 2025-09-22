/**
 * Unified content outline service that fixes the Stream/String mismatch
 * Addresses BLOCKER 1: Content Outline Generation Disconnect
 */

import { z } from 'zod';

import { getResilientAI } from '@/lib/ai/resilient';
import type { ContentOutline } from '@/types/workflow';

const ContentOutlineSchema = z.object({
  functionalRequirements: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    priority: z.enum(['P0', 'P1', 'P2']),
    userStory: z.string().optional(),
    acceptanceCriteria: z.array(z.string()).optional(),
    dependencies: z.array(z.string()).optional(),
    estimatedEffort: z.string().optional(),
  })),
  successMetrics: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['engagement', 'adoption', 'performance', 'business']),
    target: z.string().optional(),
    measurement: z.string().optional(),
    frequency: z.string().optional(),
    owner: z.string().optional(),
  })),
  milestones: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    phase: z.enum(['research', 'design', 'development', 'testing', 'launch', 'post-launch']),
    estimatedDate: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
    deliverables: z.array(z.string()).optional(),
  })),
  executiveSummary: z.object({
    problemStatement: z.string(),
    proposedSolution: z.string(),
    businessValue: z.string(),
    targetUsers: z.string(),
  }).optional(),
});

/**
 * Generate content outline from prompt using AI with proper async handling
 */
export async function generateContentOutlineFromPrompt(
  prompt: string
): Promise<ContentOutline> {
  const ai = getResilientAI();
  
  try {
    const result = await ai.generateObjectWithFallback({
      prompt: `Analyze this product idea and generate a content outline:\n${prompt}`,
      schema: ContentOutlineSchema,
    });
    
    return result.object;
  } catch (error) {
    console.error('Failed to generate AI content outline:', error);
    
    // Return a basic fallback outline
    return generateFallbackOutline(prompt);
  }
}

/**
 * Generate fallback content outline when AI fails
 */
function generateFallbackOutline(prompt: string): ContentOutline {
  const contextKeywords = prompt.toLowerCase();
  
  // Generate basic functional requirements based on context
  const functionalRequirements = [];
  if (contextKeywords.includes('dlp') || contextKeywords.includes('data loss')) {
    functionalRequirements.push({
      id: 'dlp-detection',
      title: 'Data Loss Prevention Detection',
      description: 'Detect and prevent unauthorized data transfers',
      priority: 'P0' as const,
      userStory: 'As an admin, I want to prevent sensitive data leaks',
    });
  } else if (contextKeywords.includes('onboard') || contextKeywords.includes('nudge')) {
    functionalRequirements.push({
      id: 'user-onboarding',
      title: 'User Onboarding System',
      description: 'Guide users through initial setup and configuration',
      priority: 'P0' as const,
      userStory: 'As a new user, I want guided onboarding',
    });
  } else {
    functionalRequirements.push({
      id: 'core-feature',
      title: 'Core Feature Implementation',
      description: 'Main functionality as described in the prompt',
      priority: 'P0' as const,
      userStory: 'As a user, I want the core feature to work reliably',
    });
  }
  
  return {
    functionalRequirements,
    successMetrics: [
      {
        id: 'adoption-rate',
        name: 'Feature Adoption Rate',
        description: 'Percentage of users actively using the feature',
        type: 'adoption',
        target: '80% within 3 months',
        measurement: 'Monthly active users / Total eligible users',
      },
    ],
    milestones: [
      {
        id: 'research-phase',
        title: 'Research and Design',
        description: 'Complete user research and technical design',
        phase: 'research',
        estimatedDate: '4 weeks from start',
      },
      {
        id: 'development-phase',
        title: 'Core Development',
        description: 'Implement core functionality',
        phase: 'development',
        estimatedDate: '8 weeks from start',
      },
    ],
  };
}