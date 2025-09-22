/**
 * Content Outline Agent - AI-powered generation of functional requirements, metrics, and milestones
 */

import type { StreamTextResult, CoreMessage } from "ai";

import type {
  ContentOutline,
  FunctionalRequirement,
  SuccessMetric,
  Milestone,
} from "@/types/workflow";

import { getResilientAI } from "../ai/resilient";

/**
 * System prompt for content outline generation
 */
const CONTENT_OUTLINE_SYSTEM_PROMPT = `You are an expert Chrome Enterprise Premium (CEP) Product Manager at Google, specializing in enterprise browser security, policy management, and admin tooling.

Your task is to analyze a product idea description and generate a detailed content outline with:
1. Functional Requirements (2-4 items)
2. Success Metrics (3-4 items) 
3. Milestones (3-5 items)

## Guidelines:

### Functional Requirements:
- Extract specific, actionable requirements from the user's description
- Prioritize with P0 (critical), P1 (important), P2 (nice-to-have)
- Include clear user stories and acceptance criteria
- Focus on Chrome Enterprise Premium context when applicable

### Success Metrics:
- Define measurable outcomes with specific targets
- Include measurement methodology
- Use realistic enterprise adoption timelines
- Types: adoption, engagement, performance, business impact

### Milestones:
- Create realistic timeline based on complexity
- Include research, design, development, and launch phases
- Specify deliverables for each milestone
- Use month-based estimates

## Output Format:
Return a valid JSON object with this exact structure:

{
  "functionalRequirements": [
    {
      "id": "fr-unique-id",
      "title": "Requirement Title",
      "description": "Detailed description of the requirement",
      "priority": "P0" | "P1" | "P2",
      "userStory": "As a [user type], I want to [action] so that [benefit]",
      "acceptanceCriteria": ["Criteria 1", "Criteria 2", "Criteria 3"]
    }
  ],
  "successMetrics": [
    {
      "id": "sm-unique-id",
      "name": "Metric Name",
      "description": "What this metric measures",
      "type": "adoption" | "engagement" | "performance" | "business",
      "target": "Specific target with timeline",
      "measurement": "How to measure this",
      "frequency": "How often to measure"
    }
  ],
  "milestones": [
    {
      "id": "ms-unique-id",
      "title": "Milestone Title",
      "description": "What will be accomplished",
      "phase": "research" | "design" | "development" | "launch",
      "estimatedDate": "Month X" or "Month X-Y",
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    }
  ]
}

Analyze the user's product idea carefully and create contextually relevant, specific content that directly addresses their described use case.`;

/**
 * Generate content outline using AI
 */
export async function generateAIContentOutline(
  prompt: string
): Promise<StreamTextResult<Record<string, never>, never>> {
  const ai = getResilientAI();

  const userMessage = `Product Idea:
${prompt}

Please analyze this product idea and generate a comprehensive content outline with functional requirements, success metrics, and milestones that are specifically tailored to this use case.`;

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: CONTENT_OUTLINE_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: userMessage,
    },
  ];

  return await ai.generateWithFallback(messages);
}

/**
 * Parse AI response to ContentOutline
 */
export function parseContentOutlineResponse(response: string): ContentOutline {
  try {
    // Clean up response - remove any markdown code blocks
    const cleanResponse = response
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed: unknown = JSON.parse(cleanResponse);

    // Validate structure and provide defaults
    if (typeof parsed === "object" && parsed !== null) {
      const obj = parsed as Record<string, unknown>;
      return {
        functionalRequirements: Array.isArray(obj.functionalRequirements)
          ? (obj.functionalRequirements as FunctionalRequirement[])
          : [],
        successMetrics: Array.isArray(obj.successMetrics)
          ? (obj.successMetrics as SuccessMetric[])
          : [],
        milestones: Array.isArray(obj.milestones)
          ? (obj.milestones as Milestone[])
          : [],
      };
    }

    // Return empty outline if parsed is not an object
    return {
      functionalRequirements: [],
      successMetrics: [],
      milestones: [],
    };
  } catch (error) {
    console.error("Failed to parse AI content outline response:", error);
    console.error("Response was:", response);

    // Return empty outline on parse failure
    return {
      functionalRequirements: [],
      successMetrics: [],
      milestones: [],
    };
  }
}
