"use server";

import "server-only";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const AI_MODEL_PRIMARY = process.env.AI_MODEL_PRIMARY ?? "gemini-2.0-flash-exp";

function geminiModel() {
  return google(AI_MODEL_PRIMARY);
}

export async function generatePRDContent(prompt: string) {
  const schema = z.object({
    title: z.string(),
    overview: z.string(),
    objectives: z.array(z.string()),
    requirements: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        priority: z.enum(["high", "medium", "low"]),
      })
    ),
    timeline: z.string(),
    success_metrics: z.array(z.string()),
  });

  try {
    const { object } = await generateObject({
      model: geminiModel(),
      schema,
      prompt: `Create a comprehensive Product Requirements Document based on this input: ${prompt}`,
    });

    return { success: true, data: object };
  } catch (error) {
    console.error("PRD generation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function generateContentOutline(prompt: string) {
  const schema = z.object({
    functional_requirements: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
      })
    ),
    success_metrics: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        target: z.string(),
      })
    ),
    milestones: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        timeline: z.string(),
      })
    ),
  });

  try {
    const { object } = await generateObject({
      model: geminiModel(),
      schema,
      prompt: `Create a structured outline for this product concept: ${prompt}`,
    });

    return { success: true, data: object };
  } catch (error) {
    console.error("Outline generation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
