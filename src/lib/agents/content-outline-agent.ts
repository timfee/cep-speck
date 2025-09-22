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

import {
  cleanAIResponse,
  CONTENT_OUTLINE_SYSTEM_PROMPT,
  createUserMessage,
} from "./content-outline-constants";

import { getResilientAI } from "../ai/resilient";

/**
 * Generate content outline using AI
 */
export async function generateAIContentOutline(
  prompt: string
): Promise<StreamTextResult<Record<string, never>, never>> {
  const ai = getResilientAI();
  const userMessage = createUserMessage(prompt);

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
    const cleanResponse = cleanAIResponse(response);
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
