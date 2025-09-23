/**
 * Content Outline Agent - AI-powered generation of functional requirements, metrics, and milestones
 */

import type { StreamTextResult, CoreMessage } from "ai";

import { EMPTY_OUTLINE_METADATA } from "@/lib/services/content-outline-schemas";

import type {
  ContentOutline,
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  OutlineMetadata,
  SuccessMetric,
  SuccessMetricSchema,
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
        metadata: mergeMetadata(obj.metadata),
        functionalRequirements: Array.isArray(obj.functionalRequirements)
          ? (obj.functionalRequirements as FunctionalRequirement[])
          : [],
        successMetrics: Array.isArray(obj.successMetrics)
          ? (obj.successMetrics as SuccessMetric[])
          : [],
        milestones: Array.isArray(obj.milestones)
          ? (obj.milestones as Milestone[])
          : [],
        customerJourneys: Array.isArray(obj.customerJourneys)
          ? (obj.customerJourneys as CustomerJourney[])
          : [],
        metricSchemas: Array.isArray(obj.metricSchemas)
          ? (obj.metricSchemas as SuccessMetricSchema[])
          : [],
      };
    }

    // Return empty outline if parsed is not an object
    return {
      metadata: { ...EMPTY_OUTLINE_METADATA },
      functionalRequirements: [],
      successMetrics: [],
      milestones: [],
      customerJourneys: [],
      metricSchemas: [],
    };
  } catch (error) {
    console.error("Failed to parse AI content outline response:", error);
    console.error("Response was:", response);

    // Return empty outline on parse failure
    return {
      metadata: { ...EMPTY_OUTLINE_METADATA },
      functionalRequirements: [],
      successMetrics: [],
      milestones: [],
      customerJourneys: [],
      metricSchemas: [],
    };
  }
}

function mergeMetadata(source: unknown): OutlineMetadata {
  if (typeof source !== "object" || source === null) {
    return { ...EMPTY_OUTLINE_METADATA };
  }

  return {
    ...EMPTY_OUTLINE_METADATA,
    ...(source as Partial<OutlineMetadata>),
  };
}
