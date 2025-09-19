import type { Issue, SpecPack } from "../types";

export const itemId = "executive-summary-coherence";
export type Params = Record<string, never>;

function toPrompt(params: Params, pack?: SpecPack): string {
  void params; // intentional: interface compatibility
  void pack;
  return "TL;DR must highlight at least half of the core feature set.";
}

function validate(draft: string, params: Params, pack?: SpecPack): Issue[] {
  void params;
  void pack;
  const issues: Issue[] = [];

  // Extract TL;DR section
  const tldr = draft.match(/# 1\. TL;DR[\s\S]*?(?=# 2\.|$)/)?.[0] || "";

  // Extract Functional Requirements section
  const featuresBlock =
    draft.match(/# 6\. Functional Requirements[\s\S]*?(?=# 7\.|$)/)?.[0] || "";

  // Extract feature names using pattern ## F\d+ — <Name>
  const names = [...featuresBlock.matchAll(/## F\d+ — ([^\n]+)/g)].map(
    m => m[1]
  );

  if (!names.length) {
    return issues;
  }

  // Count how many feature names appear in TL;DR (case-insensitive)
  let mentioned = 0;
  const lowTLDR = tldr.toLowerCase();

  for (const name of names) {
    if (lowTLDR.includes(name.toLowerCase())) {
      mentioned++;
    }
  }

  // Check if less than 50% of features are mentioned
  if (mentioned < names.length / 2) {
    issues.push({
      id: "tldr-feature-mismatch",
      itemId,
      severity: "warn",
      message: `TL;DR mentions only ${mentioned}/${names.length} core features`,
      evidence: `Found features: ${names.join(
        ", "
      )}; TL;DR coverage: ${Math.round((mentioned / names.length) * 100)}%`,
    });
  }

  return issues;
}

function heal(issues: Issue[], params: Params, pack?: SpecPack): string | null {
  void params;
  void pack;
  if (!issues.length) return null;

  if (issues.some(i => i.id === "tldr-feature-mismatch")) {
    return "Ensure the TL;DR section mentions the key features from the Functional Requirements section to provide executives with a complete overview of deliverables.";
  }

  return null;
}

export const itemModule = { itemId, toPrompt, validate, heal };
