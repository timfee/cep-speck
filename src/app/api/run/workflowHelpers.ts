/**
 * Workflow execution utilities for API route
 */

import { runGenerationLoop } from "@/lib/agents/hybridWorkflow";
import { DEFAULT_SPEC_PACK } from "@/lib/config";

import {
  loadKnowledgeBase,
  performResearch,
} from "@/lib/spec/api/workflowHelpers";

// Constants for magic numbers
const MAX_ALLOWED_ATTEMPTS = 5;

// Use centralized spec pack configuration
const pack = DEFAULT_SPEC_PACK;

export function calculateMaxAttempts(maxOverride?: number): number {
  return Math.min(
    maxOverride ?? pack.healPolicy.maxAttempts,
    MAX_ALLOWED_ATTEMPTS
  );
}

export async function prepareWorkflowContext({
  specText,
  maxAttempts,
  startTime,
  streamController,
}: {
  specText: string;
  maxAttempts: number;
  startTime: number;
  streamController: { enqueue: (frame: Uint8Array) => void };
}) {
  const workflowContext = {
    specText,
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
  maxAttempts,
  startTime,
  streamController,
}: {
  specText: string;
  maxAttempts: number;
  startTime: number;
  streamController: { enqueue: (frame: Uint8Array) => void };
}) {
  const { knowledgeContext, researchContext } = await prepareWorkflowContext({
    specText,
    maxAttempts,
    startTime,
    streamController,
  });

  await runGenerationLoop({
    specText,
    knowledgeContext,
    researchContext,
    pack,
    maxAttempts,
    startTime,
    safeEnqueue: streamController.enqueue,
  });
}
