/**
 * Shared utilities for validation modules
 *
 * This module provides common helpers to reduce code duplication
 * across validation item modules.
 */

export * from "./constants";
export * from "./healing";
export * from "./patterns";
export * from "./semantic/sectionExtraction";
export * from "./semantic/validationIssues";
export * from "./validation";

// Export remaining healing helper functions
export {
  deduplicateIssues,
  groupIssuesByItem,
  sortItemIdsByPriority,
} from "../healing/helpers";
