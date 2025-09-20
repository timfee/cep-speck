import { promises as fs } from "fs";
import path from "path";

import { generateObject } from "ai";
import { z } from "zod";

import { geminiModel } from "@/lib/ai/provider";

// Schema for structured outline
const StructuredOutlineSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      notes: z.string(),
    })
  ),
});

export type StructuredOutline = z.infer<typeof StructuredOutlineSchema>;

// Load functional requirements at runtime
async function loadFunctionalRequirements(): Promise<string> {
  try {
    const requirementsPath = path.join(
      process.cwd(),
      "guides",
      "functional_requirements.md"
    );
    return await fs.readFile(requirementsPath, "utf-8");
  } catch (error) {
    console.warn("Could not load functional requirements:", error);
    return "Create a standard PRD outline with sections like TL;DR, People Problems, Goals, Functional Requirements, Success Metrics, and Annexes.";
  }
}

export async function outlinerAgent(brief: string): Promise<StructuredOutline> {
  const provider = geminiModel();
  const requirements = await loadFunctionalRequirements();

  const systemPrompt = `You are a world-class product manager. Your task is to analyze the following user brief and generate a structured JSON outline for a PRD.

${requirements}

You must return a JSON object with a "sections" array. Each section should have:
- id: unique identifier (string)
- title: section title (string) 
- notes: initially empty string (user will add notes later)

Include standard sections like TL;DR, People Problems, Goals, Functional Requirements, Success Metrics, and Annexes. Add any other sections you deem relevant based on the brief.

Focus only on structure and section headers. Do not write content.`;

  const userPrompt = `Brief: ${brief}`;

  try {
    const { object } = await generateObject({
      model: provider,
      schema: StructuredOutlineSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return object;
  } catch (error) {
    console.error("Outliner agent failed:", error);
    // Return a fallback outline
    return {
      sections: [
        { id: "1", title: "TL;DR", notes: "" },
        { id: "2", title: "People Problems", notes: "" },
        { id: "3", title: "Goals", notes: "" },
        { id: "4", title: "Functional Requirements", notes: "" },
        { id: "5", title: "Success Metrics", notes: "" },
        { id: "6", title: "Technical Considerations", notes: "" },
        { id: "7", title: "Annexes", notes: "" },
      ],
    };
  }
}
