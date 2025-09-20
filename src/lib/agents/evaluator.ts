import { promises as fs } from "fs";
import path from "path";

import { generateObject } from "ai";
import { z } from "zod";

import { geminiModel } from "@/lib/ai/provider";

// Schema for evaluation report
const EvaluationReportSchema = z.array(
  z.object({
    section: z.string(),
    issue: z.string(),
    evidence: z.string(),
    suggestion: z.string(),
  })
);

export type EvaluationReport = z.infer<typeof EvaluationReportSchema>;

// Load style and principles guide
async function loadStyleAndPrinciplesGuide(): Promise<string> {
  try {
    const guidePath = path.join(
      process.cwd(),
      "guides",
      "style_and_principles_guide.md"
    );
    return await fs.readFile(guidePath, "utf-8");
  } catch (error) {
    console.warn("Could not load style and principles guide:", error);
    return `Evaluate the PRD for:
- No fluff or marketing language
- Quantified metrics with timeframes
- Technical realism
- Clear traceability between problems, features, and metrics
- Specific placeholders instead of vague ones
- SKU differentiation
- Proper citations for factual claims`;
  }
}

export async function evaluatorAgent(draft: string): Promise<EvaluationReport> {
  const provider = geminiModel();
  const styleGuide = await loadStyleAndPrinciplesGuide();

  const systemPrompt = `You are a PRD quality assurance expert. Analyze the following PRD draft. Your only job is to find flaws based on the 'Style & Principles Guide'. Respond only with a JSON array of issues. If there are no issues, return an empty array []. Do not be conversational. Do not fix the issues.

Style & Principles Guide:
${styleGuide}

Return an array of issue objects with these fields:
- section: The section name where the issue was found
- issue: Brief description of the issue type
- evidence: The specific text that demonstrates the problem
- suggestion: Specific recommendation for how to fix it

Be thorough but precise. Only report actual violations of the principles.`;

  const userPrompt = `PRD Draft to evaluate:\n\n${draft}`;

  try {
    const { object } = await generateObject({
      model: provider,
      schema: EvaluationReportSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return object;
  } catch (error) {
    console.error("Evaluator agent failed:", error);
    // Return empty report on failure (assume no issues)
    return [];
  }
}
