/**
 * Type definitions for workflow components
 */

import type { SpecPack } from "../../spec/types";

export interface GenerationLoopContext {
  /** User input specification text */
  specText: string;
  /** Knowledge base context */
  knowledgeContext: string;
  /** Research context */
  researchContext: string;
  /** SpecPack configuration */
  pack: SpecPack;
  /** Maximum retry attempts */
  maxAttempts: number;
  /** Workflow start time */
  startTime: number;
  /** Stream frame enqueue function */
  safeEnqueue: (frame: Uint8Array) => void;
}
