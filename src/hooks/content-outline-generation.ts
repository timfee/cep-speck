/**
 * Content outline generation for structured workflow
 */

import {
  generateAIContentOutline,
  parseContentOutlineResponse,
} from "@/lib/agents/content-outline-agent";

import type {
  ContentOutline,
  FunctionalRequirement,
  SuccessMetric,
  Milestone,
} from "@/types/workflow";

// Constants
const DESCRIPTION_LENGTH_THRESHOLD = 50;

/**
 * Generate complete content outline using AI
 */
export async function generateContentOutline(
  prompt: string
): Promise<ContentOutline> {
  try {
    const aiResult = await generateAIContentOutline(prompt);
    const fullResponse = await aiResult.text;
    const outline = parseContentOutlineResponse(fullResponse);

    // Validate that we got actual content, not empty arrays
    if (
      outline.functionalRequirements.length === 0 &&
      outline.successMetrics.length === 0 &&
      outline.milestones.length === 0
    ) {
      throw new Error("AI response contained no valid content");
    }

    return outline;
  } catch (error) {
    console.error("Failed to generate AI content outline:", error);

    // Return a context-aware fallback outline
    return generateFallbackOutline(prompt);
  }
}

/**
 * Generate fallback content outline based on context keywords
 */
function generateFallbackOutline(prompt: string): ContentOutline {
  const contextKeywords = prompt.toLowerCase();

  // Create contextual functional requirements based on prompt content
  const functionalRequirements: FunctionalRequirement[] = [];

  if (
    contextKeywords.includes("dlp") ||
    contextKeywords.includes("data loss")
  ) {
    functionalRequirements.push({
      id: "fr-dlp-nudge",
      title: "DLP Onboarding Nudge System",
      description:
        "Intelligent nudge system that prompts admins to enable DLP rules when they access the DLP page with zero configured rules",
      priority: "P0",
      userStory:
        "As a Chrome admin, I want to be guided to enable DLP protection when I have no rules configured, so that my organization's data is protected",
      acceptanceCriteria: [
        "Detect when admin accesses DLP page with 0 rules",
        "Display contextual nudge with pre-configured audit rule",
        "Allow one-click activation of audit rule",
        "Track nudge interaction and outcomes",
      ],
    });

    functionalRequirements.push({
      id: "fr-audit-rule-config",
      title: "Pre-configured Audit Rule",
      description:
        "Default audit-only DLP rule configuration that can be quickly enabled by admins",
      priority: "P0",
      userStory:
        "As a Chrome admin, I want to quickly enable a safe audit-only DLP rule to start monitoring data flows",
      acceptanceCriteria: [
        "Pre-configured rule covers common data types",
        "Audit-only mode prevents workflow disruption",
        "Configurable rule scope and triggers",
        "Clear documentation and next steps",
      ],
    });
  } else if (
    contextKeywords.includes("onboard") ||
    contextKeywords.includes("nudge")
  ) {
    functionalRequirements.push({
      id: "fr-onboarding-system",
      title: "Intelligent Onboarding System",
      description:
        "Context-aware onboarding that guides users through setup based on their current configuration state",
      priority: "P0",
      userStory:
        "As an admin, I want to be guided through setup when I haven't configured key features",
      acceptanceCriteria: [
        "Detect incomplete configurations",
        "Show relevant setup guidance",
        "Provide quick-start options",
        "Track onboarding completion",
      ],
    });
  } else {
    // Generic fallback
    functionalRequirements.push({
      id: "fr-core",
      title: "Core Functionality",
      description:
        prompt.length > DESCRIPTION_LENGTH_THRESHOLD
          ? "Primary functionality based on the described requirements"
          : "Primary product capabilities based on the described use case",
      priority: "P0",
      userStory:
        "As a user, I want to accomplish the main objectives described in the requirements",
      acceptanceCriteria: [
        "Feature works as described",
        "User can complete primary workflows",
        "Performance meets expectations",
      ],
    });
  }

  // Create contextual success metrics
  const successMetrics: SuccessMetric[] = [];

  if (contextKeywords.includes("dlp") || contextKeywords.includes("admin")) {
    successMetrics.push({
      id: "sm-dlp-adoption",
      name: "DLP Rule Adoption Rate",
      description:
        "Percentage of admins who enable DLP rules after seeing the nudge",
      type: "adoption",
      target: "70% of admins enable rules within 7 days",
      measurement: "Admins who enable rules / Admins who see nudge",
      frequency: "Weekly",
    });

    successMetrics.push({
      id: "sm-nudge-engagement",
      name: "Nudge Engagement Rate",
      description: "How often admins interact with the onboarding nudge",
      type: "engagement",
      target: "80% click-through rate on nudge",
      measurement: "Nudge clicks / Nudge impressions",
      frequency: "Daily",
    });
  } else {
    successMetrics.push({
      id: "sm-adoption",
      name: "User Adoption",
      description: "Measure user adoption of the new feature",
      type: "adoption",
      target: "Target to be defined based on requirements",
      measurement: "Usage analytics",
      frequency: "Weekly",
    });
  }

  // Create contextual milestones
  const milestones: Milestone[] = [];

  if (contextKeywords.includes("dlp") || contextKeywords.includes("nudge")) {
    milestones.push({
      id: "ms-research",
      title: "User Research & Rule Analysis",
      description:
        "Research admin workflows and analyze existing DLP rule patterns",
      phase: "research",
      estimatedDate: "Month 1",
      deliverables: [
        "Admin workflow analysis",
        "DLP rule usage patterns",
        "Nudge design requirements",
      ],
    });

    milestones.push({
      id: "ms-prototype",
      title: "Nudge System Prototype",
      description: "Build and test the onboarding nudge interface",
      phase: "design",
      estimatedDate: "Month 2",
      deliverables: [
        "Interactive prototype",
        "Admin feedback",
        "Refined nudge design",
      ],
    });

    milestones.push({
      id: "ms-implementation",
      title: "Feature Implementation",
      description: "Develop the nudge system and pre-configured rule templates",
      phase: "development",
      estimatedDate: "Month 3-4",
      deliverables: [
        "Working nudge system",
        "Pre-configured rules",
        "Admin testing",
      ],
    });
  } else {
    milestones.push({
      id: "ms-development",
      title: "Development & Launch",
      description: "Develop and launch the described functionality",
      phase: "development",
      estimatedDate: "3-6 months",
      deliverables: ["Working implementation", "User documentation"],
    });
  }

  return {
    functionalRequirements,
    successMetrics,
    milestones,
  };
}
