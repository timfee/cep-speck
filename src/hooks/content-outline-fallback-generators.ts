import type {
  FunctionalRequirement,
  SuccessMetric,
  Milestone,
} from "@/types/workflow";

// Constants
const DESCRIPTION_LENGTH_THRESHOLD = 50;

/**
 * Generate DLP-specific functional requirements
 */
export function generateDLPRequirements(): FunctionalRequirement[] {
  return [
    {
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
    },
    {
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
    },
  ];
}

/**
 * Generate onboarding-specific functional requirements
 */
export function generateOnboardingRequirements(): FunctionalRequirement[] {
  return [
    {
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
    },
  ];
}

/**
 * Generate generic functional requirements
 */
export function generateGenericRequirements(
  prompt: string
): FunctionalRequirement[] {
  return [
    {
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
    },
  ];
}

/**
 * Generate DLP-specific success metrics
 */
export function generateDLPMetrics(): SuccessMetric[] {
  return [
    {
      id: "sm-dlp-adoption",
      name: "DLP Rule Adoption Rate",
      description:
        "Percentage of admins who enable DLP rules after seeing the nudge",
      type: "adoption",
      target: "70% of admins enable rules within 7 days",
      measurement: "Admins who enable rules / Admins who see nudge",
    },
    {
      id: "sm-nudge-engagement",
      name: "Nudge Engagement Rate",
      description: "How often admins interact with the onboarding nudge",
      type: "engagement",
      target: "80% click-through rate on nudge",
      measurement: "Nudge clicks / Nudge impressions",
    },
  ];
}

/**
 * Generate generic success metrics
 */
export function generateGenericMetrics(): SuccessMetric[] {
  return [
    {
      id: "sm-adoption",
      name: "Feature Adoption Rate",
      description: "Percentage of users who adopt the new feature",
      type: "adoption",
      target: "60% of target users within 30 days",
      measurement: "Active users / Total invited users",
    },
    {
      id: "sm-satisfaction",
      name: "User Satisfaction Score",
      description: "Overall user satisfaction with the feature",
      type: "engagement",
      target: "4.5/5 average rating",
      measurement: "User feedback surveys and ratings",
    },
  ];
}

/**
 * Generate DLP-specific milestones
 */
export function generateDLPMilestones(): Milestone[] {
  return [
    {
      id: "ms-dlp-research",
      title: "User Research & Rule Analysis",
      description:
        "Research admin workflows and analyze existing DLP rule patterns",
      phase: "research",
      estimatedDate: "Month 1",
    },
    {
      id: "ms-dlp-prototype",
      title: "Nudge System Prototype",
      description: "Build and test the onboarding nudge interface",
      phase: "design",
      estimatedDate: "Month 2",
    },
    {
      id: "ms-dlp-implementation",
      title: "Feature Implementation",
      description: "Develop the nudge system and pre-configured rule templates",
      phase: "development",
      estimatedDate: "Month 3-4",
    },
  ];
}

/**
 * Generate generic milestones
 */
export function generateGenericMilestones(): Milestone[] {
  return [
    {
      id: "ms-research",
      title: "Research & Discovery",
      description: "User research and technical feasibility analysis",
      phase: "research",
      estimatedDate: "Month 1",
    },
    {
      id: "ms-design",
      title: "Design & Prototyping",
      description: "Create mockups and interactive prototypes",
      phase: "design",
      estimatedDate: "Month 2",
    },
    {
      id: "ms-development",
      title: "Development & Testing",
      description: "Build and test the feature implementation",
      phase: "development",
      estimatedDate: "Month 3-4",
    },
  ];
}
