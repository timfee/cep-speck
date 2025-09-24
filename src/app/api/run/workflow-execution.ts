/**
 * Workflow execution utilities for API route
 */

import { runGenerationLoop } from "@/lib/agents/hybrid-workflow";
import { DEFAULT_SPEC_PACK } from "@/lib/config";

import type {
  SerializedWorkflowOutline,
  SerializedWorkflowSpec,
} from "@/types/workflow";

import { loadKnowledgeBase, performResearch } from "./workflow-context";

// Constants for magic numbers
const MAX_ALLOWED_ATTEMPTS = 5;
const DEFAULT_HEAL_ATTEMPTS = 3; // Default attempts for hybrid workflow

// Use centralized spec pack configuration
const pack = DEFAULT_SPEC_PACK;

/**
 * Calculate maximum attempts for healing workflow
 * Uses default value since healPolicy is removed in hybrid migration
 */
export function calculateMaxAttempts(maxOverride?: number): number {
  return Math.min(maxOverride ?? DEFAULT_HEAL_ATTEMPTS, MAX_ALLOWED_ATTEMPTS);
}

export async function prepareWorkflowContext({
  specText,
  structuredSpec,
  outlinePayload,
  maxAttempts,
  startTime,
  streamController,
}: {
  specText: string;
  structuredSpec?: SerializedWorkflowSpec;
  outlinePayload?: SerializedWorkflowOutline;
  maxAttempts: number;
  startTime: number;
  streamController: { enqueue: (frame: Uint8Array) => void };
}) {
  const workflowContext = {
    specText,
    structuredSpec,
    outlinePayload,
    pack,
    maxAttempts,
    startTime,
    safeEnqueue: streamController.enqueue,
  };

  const knowledgeContext = await loadKnowledgeBase(workflowContext);
  const researchContext = performResearch(workflowContext);

  return { knowledgeContext, researchContext };
}

export async function executeHybridWorkflow({
  specText,
  structuredSpec,
  outlinePayload,
  maxAttempts,
  startTime,
  streamController,
}: {
  specText: string;
  structuredSpec?: SerializedWorkflowSpec;
  outlinePayload?: SerializedWorkflowOutline;
  maxAttempts: number;
  startTime: number;
  streamController: { enqueue: (frame: Uint8Array) => void };
}) {
  const { knowledgeContext, researchContext } = await prepareWorkflowContext({
    specText,
    structuredSpec,
    outlinePayload,
    maxAttempts,
    startTime,
    streamController,
  });

  await runGenerationLoop({
    specText,
    structuredSpec,
    outlinePayload,
    knowledgeContext,
    researchContext,
    pack,
    maxAttempts,
    startTime,
    safeEnqueue: streamController.enqueue,
  });
}
