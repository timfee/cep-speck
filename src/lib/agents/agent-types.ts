/**
 * Type definitions for agents
 */

/**
 * Configuration for the refiner agent
 */
export interface RefinerConfig {
  /** Whether to include original content preservation instructions */
  preserveOriginal?: boolean;
  /** Maximum number of refinement iterations */
  maxIterations?: number;
  /** Whether to focus on specific issue types */
  focusAreas?: ("deterministic" | "semantic" | "quality")[];
}

/**
 * Result of refiner operation
 */
export interface RefinerResult {
  /** The refined document content */
  content: string;
  /** Number of issues addressed */
  issuesFixed: number;
  /** Processing metadata */
  metadata: {
    /** Duration in milliseconds */
    duration: number;
    /** Agent identifier */
    agentId: string;
    /** Issues that were addressed */
    addressedIssues: string[];
  };
}
