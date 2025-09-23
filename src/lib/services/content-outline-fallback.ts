import type { ContentOutline } from "@/types/workflow";

import { EMPTY_OUTLINE_METADATA } from "./content-outline-schemas";

type OutlineContext = {
  keywords: string;
};

function buildFunctionalRequirements(context: OutlineContext) {
  const requirements: ContentOutline["functionalRequirements"] = [];
  const { keywords } = context;

  if (keywords.includes("dlp") || keywords.includes("data loss")) {
    requirements.push({
      id: "dlp-detection",
      title: "Data Loss Prevention Detection",
      description: "Detect and prevent unauthorized data transfers",
      priority: "P0",
      userStory: "As an admin, I want to prevent sensitive data leaks",
    });
    return requirements;
  }

  if (keywords.includes("onboard") || keywords.includes("nudge")) {
    requirements.push({
      id: "user-onboarding",
      title: "User Onboarding System",
      description: "Guide users through initial setup and configuration",
      priority: "P0",
      userStory: "As a new user, I want guided onboarding",
    });
    return requirements;
  }

  requirements.push({
    id: "core-feature",
    title: "Core Feature Implementation",
    description: "Main functionality as described in the prompt",
    priority: "P0",
    userStory: "As a user, I want the core feature to work reliably",
  });

  return requirements;
}

function buildFallbackSuccessMetrics() {
  return [
    {
      id: "adoption-rate",
      name: "Feature Adoption Rate",
      description: "Percentage of users actively using the feature",
      type: "adoption" as const,
      target: "80% within 3 months",
      measurement: "Monthly active users / Total eligible users",
    },
  ];
}

function buildFallbackMilestones() {
  return [
    {
      id: "research-phase",
      title: "Research and Design",
      description: "Complete user research and technical design",
      phase: "research" as const,
      estimatedDate: "4 weeks from start",
    },
    {
      id: "development-phase",
      title: "Core Development",
      description: "Implement core functionality",
      phase: "development" as const,
      estimatedDate: "8 weeks from start",
    },
  ];
}

export function buildFallbackOutline(prompt: string): ContentOutline {
  const context: OutlineContext = { keywords: prompt.toLowerCase() };

  return {
    metadata: { ...EMPTY_OUTLINE_METADATA, problemStatement: prompt },
    functionalRequirements: buildFunctionalRequirements(context),
    successMetrics: buildFallbackSuccessMetrics(),
    milestones: buildFallbackMilestones(),
    customerJourneys: [],
    metricSchemas: [],
  };
}
