/**
 * Zod schemas for agent validation
 */

import { z } from "zod";

/**
 * Common issue schema used across all evaluation types
 */
export const IssueSchema = z.object({
  section: z.string().describe("Specific section where issue occurs"),
  description: z.string().describe("Clear explanation of the problem"),
  suggestion: z.string().describe("Specific fix recommendation"),
  severity: z.enum(["error", "warn"]).describe("Issue severity level"),
});

/**
 * Base analysis schema with common boolean checks and issues array
 */
export const createAnalysisSchema = (checks: Record<string, string>) =>
  z.object({
    ...Object.fromEntries(
      Object.entries(checks).map(([key, desc]) => [
        key,
        z.boolean().describe(desc),
      ])
    ),
    issues: z.array(IssueSchema).describe("List of issues found"),
  });

/**
 * Complete semantic evaluation schema
 */
export const SemanticEvaluationSchema = z.object({
  coherence: createAnalysisSchema({
    crossReferenceAccuracy:
      "Do all metrics, features, and goals align between sections?",
    narrativeFlow:
      "Does the document tell a coherent story from problem to solution?",
    personaCoverage:
      "Are all target personas consistently addressed throughout?",
    traceability:
      "Can you trace problems → features → metrics in a logical chain?",
  }),
  quality: createAnalysisSchema({
    toneAndVoice:
      "Is the language professional, direct, and confidence-inspiring?",
    specificity:
      "Are claims backed by concrete numbers, timelines, and sources?",
    clarity: "Would a busy executive understand the key points in 2 minutes?",
    conciseness: "Is every sentence adding value or just filling space?",
  }),
  realism: createAnalysisSchema({
    timelinePlausibility:
      "Are adoption estimates realistic for enterprise environments?",
    technicalFeasibility:
      "Do proposed features align with current browser capabilities?",
    marketUnderstanding:
      "Do competitive claims reflect actual market positioning?",
    resourceRequirements: "Are implementation expectations achievable?",
  }),
  overallAssessment: z.object({
    isPublicationReady: z
      .boolean()
      .describe("Would this document pass rigorous executive review?"),
    criticalIssues: z
      .number()
      .describe("Number of critical issues that block publication"),
    improvementNeeded: z
      .boolean()
      .describe("Does the document need significant improvement?"),
  }),
});

/**
 * Type for the semantic evaluation result
 */
export type SemanticEvaluationResult = z.infer<typeof SemanticEvaluationSchema>;
