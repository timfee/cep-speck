import { geminiModel } from "@/lib/ai/provider";
import { generateObject } from "ai";
import { z } from "zod";
import type { Issue } from "./types";

const SelfReviewSchema = z.object({
  confirmedIssues: z.array(
    z.object({
      originalIndex: z.number(),
      confidence: z.enum(["high", "medium", "low"]),
      reasoning: z.string(),
    })
  ),
  filteredOut: z.array(
    z.object({
      originalIndex: z.number(),
      reason: z.string(),
    })
  ),
});

export type SelfReviewResult = z.infer<typeof SelfReviewSchema>;

/**
 * AI self-review layer that provides probabilistic confirmation of validation issues.
 * Reviews borderline issues and filters out false positives while confirming genuine violations.
 */
export async function performSelfReview(
  draft: string,
  issues: Issue[]
): Promise<{
  confirmed: Issue[];
  filtered: Issue[];
  reviewResult: SelfReviewResult;
}> {
  if (issues.length === 0) {
    return {
      confirmed: [],
      filtered: [],
      reviewResult: { confirmedIssues: [], filteredOut: [] },
    };
  }

  // Only review issues that aren't clearly critical errors
  const reviewableIssues = issues.filter(
    (issue) =>
      issue.severity !== "error" ||
      issue.itemId === "banned-text" ||
      issue.itemId === "executive-quality"
  );

  if (reviewableIssues.length === 0) {
    // All issues are critical errors, no review needed
    return {
      confirmed: issues,
      filtered: [],
      reviewResult: { confirmedIssues: [], filteredOut: [] },
    };
  }

  const prompt = buildSelfReviewPrompt(draft, reviewableIssues);

  try {
    const { object: reviewResult } = await generateObject({
      model: geminiModel(),
      prompt,
      schema: SelfReviewSchema,
    });

    // Separate confirmed and filtered issues
    const confirmedIndices = new Set(
      reviewResult.confirmedIssues.map((c) => c.originalIndex)
    );
    const filteredIndices = new Set(
      reviewResult.filteredOut.map((f) => f.originalIndex)
    );

    const confirmed: Issue[] = [];
    const filtered: Issue[] = [];

    issues.forEach((issue, index) => {
      if (reviewableIssues.includes(issue)) {
        if (confirmedIndices.has(index)) {
          confirmed.push(issue);
        } else if (filteredIndices.has(index)) {
          filtered.push(issue);
        } else {
          // Default to confirmed if not explicitly filtered
          confirmed.push(issue);
        }
      } else {
        // Critical errors always confirmed
        confirmed.push(issue);
      }
    });

    return { confirmed, filtered, reviewResult };
  } catch (error) {
    console.warn(
      "Self-review failed, defaulting to all issues confirmed:",
      error
    );
    return {
      confirmed: issues,
      filtered: [],
      reviewResult: { confirmedIssues: [], filteredOut: [] },
    };
  }
}

function buildSelfReviewPrompt(draft: string, issues: Issue[]): string {
  const issueList = issues
    .map(
      (issue, index) =>
        `${index}. [${issue.severity}] ${issue.itemId}: ${issue.message}`
    )
    .join("\n");

  return `You are reviewing validation issues for a PRD document to filter out false positives while confirming genuine violations.

**Document excerpt:**
${draft.substring(0, 2000)}${draft.length > 2000 ? "..." : ""}

**Validation Issues to Review:**
${issueList}

**Instructions:**
1. Analyze each issue in context of the document
2. Confirm issues that are genuinely problematic 
3. Filter out false positives or overly strict interpretations
4. For banned text issues, confirm only if the phrase genuinely reduces document quality
5. For executive quality issues, confirm only if the violation significantly impacts clarity or professionalism

**Response Format:**
- confirmedIssues: Issues that are genuine problems (include originalIndex, confidence level, reasoning)
- filteredOut: Issues that are false positives or acceptable in context (include originalIndex, reason)

Be conservative - when in doubt, confirm the issue rather than filter it out.`;
}
