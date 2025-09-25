"use server";

import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const SYSTEM_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const DEFAULT_MODEL = "gemini-2.0-flash-exp";

export type AIModel = 
  | "gemini-2.0-flash-thinking-exp"
  | "gemini-2.0-flash-exp" 
  | "gemini-1.5-pro" 
  | "gemini-1.5-flash";

export interface AIConfig {
  apiKey?: string;
  model?: AIModel;
}

function createGeminiModel(config: AIConfig = {}) {
  const apiKey = config.apiKey ?? SYSTEM_API_KEY;
  const model = config.model ?? DEFAULT_MODEL;
  
  if (!apiKey) {
    throw new Error("No API key available. Please configure your Google AI API key.");
  }

  const google = createGoogleGenerativeAI({ apiKey });
  return google(model);
}

export async function validateConfig(config: AIConfig): Promise<{ valid: boolean; error?: string }> {
  try {
    const model = createGeminiModel(config);
    // Simple validation with minimal token usage
    await generateObject({
      model,
      schema: z.object({ test: z.string() }),
      prompt: "Respond with test: 'ok'"
    });
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : "Configuration validation failed" 
    };
  }
}

export async function generatePRDContent(
  prompt: string, 
  config: AIConfig = {},
  onProgress?: (step: string, message: string) => void
) {
  const schema = z.object({
    title: z.string().describe("Clear, concise product title"),
    overview: z.string().describe("Comprehensive product overview explaining the purpose and value"),
    objectives: z.array(z.string()).describe("Key business and user objectives this product aims to achieve"),
    requirements: z.array(
      z.object({
        title: z.string().describe("Requirement title"),
        description: z.string().describe("Detailed requirement description with specific criteria"),
        priority: z.enum(["high", "medium", "low"]).describe("Priority level based on business impact"),
      })
    ).describe("Functional and non-functional requirements"),
    timeline: z.string().describe("Development timeline with key milestones"),
    success_metrics: z.array(z.string()).describe("Measurable success criteria and KPIs"),
  });

  try {
    const model = createGeminiModel(config);
    
    onProgress?.("input", "Processing your product concept...");
    
    // Enhanced prompt with better context
    const enhancedPrompt = `As a senior product manager, create a comprehensive Product Requirements Document (PRD) for the following concept:

${prompt}

Focus on:
- Clear business value and user needs
- Specific, measurable requirements 
- Realistic timelines and priorities
- Enterprise-grade considerations for scalability and security
- Success metrics that align with business objectives

Provide actionable, detailed content that development teams can implement.`;

    onProgress?.("thinking", "AI analyzing requirements and generating structured PRD...");

    const { object } = await generateObject({
      model,
      schema,
      prompt: enhancedPrompt,
    });

    onProgress?.("output", "Finalizing PRD document...");

    return { success: true, data: object };
  } catch (error) {
    console.error("PRD generation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function generateContentOutline(
  prompt: string, 
  config: AIConfig = {},
  onProgress?: (step: string, message: string) => void
) {
  const schema = z.object({
    functional_requirements: z.array(
      z.object({
        id: z.string().describe("Unique identifier for the requirement"),
        title: z.string().describe("Clear, actionable requirement title"),
        description: z.string().describe("Detailed description with acceptance criteria"),
      })
    ).describe("Core functional capabilities the product must provide"),
    success_metrics: z.array(
      z.object({
        id: z.string().describe("Unique metric identifier"),
        name: z.string().describe("Descriptive metric name"),
        target: z.string().describe("Specific, measurable target with baseline and timeframe"),
      })
    ).describe("Key performance indicators to track product success"),
    milestones: z.array(
      z.object({
        id: z.string().describe("Unique milestone identifier"),
        title: z.string().describe("Milestone name"),
        timeline: z.string().describe("Target completion date or timeframe"),
      })
    ).describe("Major development and launch milestones"),
  });

  try {
    const model = createGeminiModel(config);
    
    onProgress?.("input", "Analyzing your product concept...");
    
    // Research-oriented prompt for better outline
    const enhancedPrompt = `As a product strategist, analyze this product concept and create a structured outline:

${prompt}

Research considerations:
- What similar products exist in the market?
- What are the key user pain points this addresses?
- What technical capabilities are required?
- How should success be measured?

Provide specific, measurable requirements and realistic timelines based on industry best practices.`;

    onProgress?.("rag", "Researching market context and best practices...");
    onProgress?.("thinking", "Structuring requirements and milestones...");

    const { object } = await generateObject({
      model,
      schema,
      prompt: enhancedPrompt,
    });

    onProgress?.("output", "Outline generated successfully!");

    return { success: true, data: object };
  } catch (error) {
    console.error("Outline generation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
