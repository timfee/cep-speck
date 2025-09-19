import type { Issue } from "../types";

export const itemId = "competitor-research";
export type Params = {
  vendors: string[];
  recencyDays: number;
  requireResearch: boolean;
};

 
function toPrompt(params: Params, _pack?: unknown): string {
  const vendors = params.vendors.join(", ");
  return `IMPORTANT: Use your web search capabilities to research current information about these enterprise browser vendors: ${vendors}. For each vendor, research and include specific details about: onboarding defaults, policy templates, enterprise browser posture, data protection capabilities, and mobile support. Include a brief competitive snapshot in the TL;DR section with specific vendor capabilities and positioning. Add citations with sources and dates in a Footnotes section after the Annexes. Use sources from the last ${params.recencyDays} days when possible.`;
}

 
function validate(draft: string, params: Params, _pack?: unknown): Issue[] {
  const issues: Issue[] = [];

  if (params.requireResearch) {
    const tldrMatch = draft.match(/# 1\. TL;DR[\s\S]*?(?=# 2\.|$)/i);
    if (tldrMatch) {
      const tldrContent = tldrMatch[0];
      const hasCompetitiveSnapshot =
        /competitive snapshot|competitor|enterprise browser|policy template/i.test(
          tldrContent
        );

      if (!hasCompetitiveSnapshot) {
        issues.push({
          id: "missing-competitive-research",
          itemId,
          severity: "error",
          message: "TL;DR section missing competitive snapshot",
          evidence: "No competitive analysis found in TL;DR",
        });
      }

      const vendorMentions = params.vendors.filter((vendor) =>
        tldrContent.toLowerCase().includes(vendor.toLowerCase())
      );

      if (vendorMentions.length === 0) {
        issues.push({
          id: "missing-vendor-analysis",
          itemId,
          severity: "warn",
          message: "TL;DR missing specific vendor analysis",
          evidence: `Expected mentions of: ${params.vendors.join(", ")}`,
        });
      }
    }

    const hasFootnotes = /footnotes|references|citations/i.test(draft);
    if (!hasFootnotes) {
      issues.push({
        id: "missing-research-citations",
        itemId,
        severity: "warn",
        message: "Missing research citations in footnotes",
        evidence: "No footnotes section found",
      });
    }

    const pmInputMatches = draft.match(/\[PM_INPUT_NEEDED:[^\]]+\]/g) ?? [];
    const researchableTopics = pmInputMatches.filter((match) =>
      /competitor|research|analysis|snapshot/i.test(match)
    );

    if (researchableTopics.length > 2) {
      issues.push({
        id: "insufficient-research",
        itemId,
        severity: "warn",
        message:
          "Too many research placeholders - web research should auto-fill more facts",
        evidence: `Found ${researchableTopics.length} researchable placeholders`,
      });
    }
  }

  return issues;
}

 
function heal(issues: Issue[], params: Params, _pack?: unknown): string | null {
  if (!issues.length) return null;

  const vendors = params.vendors.join(", ");
  return `Research and integrate competitive information about ${vendors} into the TL;DR section. Focus on onboarding defaults, policy templates, enterprise browser capabilities, and data protection features. Add citations as numbered footnotes after the Annexes section.`;
}

export const itemModule = { itemId, toPrompt, validate, heal };
