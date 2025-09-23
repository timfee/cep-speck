import { PATTERNS, extractSection } from "../../helpers";

export interface ExtractedSections {
  tldr: string | null;
  problems: string | null;
  goals: string | null;
  cujs: string | null;
  features: string | null;
  metrics: string | null;
}

export function extractKeyPrdSections(draft: string): ExtractedSections {
  return {
    tldr: extractSection(draft, PATTERNS.TLDR_SECTION),
    problems: extractSection(draft, PATTERNS.PEOPLE_PROBLEMS_SECTION),
    goals: extractSection(draft, PATTERNS.GOALS_SECTION),
    cujs: extractSection(draft, PATTERNS.CUJS_SECTION),
    features: extractSection(
      draft,
      /# 6\. Functional Requirements[\s\S]*?(?=# 7\.|$)/
    ),
    metrics: extractSection(draft, PATTERNS.SUCCESS_METRICS_SECTION),
  };
}

export function areRequiredSectionsPresent(
  sections: ExtractedSections
): boolean {
  return (
    sections.tldr !== null &&
    sections.problems !== null &&
    sections.features !== null &&
    sections.metrics !== null
  );
}

export function buildAnalysisPrompt(
  sections: ExtractedSections,
  personas: string[]
): string {
  return `Analyze this PRD for semantic quality, coherence, and realism.
Required Personas: ${personas.join(", ")}

---TL;DR---
${sections.tldr}
---PEOPLE PROBLEMS---
${sections.problems}
---GOALS---
${sections.goals ?? "Not provided"}
---CUJS---
${sections.cujs ?? "Not provided"}
---FUNCTIONAL REQUIREMENTS---
${sections.features}
---SUCCESS METRICS---
${sections.metrics}
---END SECTIONS---

Validate all coherence, quality, and realism rules in one pass.`;
}
