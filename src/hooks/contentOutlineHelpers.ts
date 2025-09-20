// Content outline generation helpers for structured workflow

import type {
  ContentOutline,
  FunctionalRequirement,
  SuccessMetric,
  Milestone,
} from "@/types/workflow";

// Generate functional requirements based on prompt analysis
export function generateFunctionalRequirements(
  prompt: string
): FunctionalRequirement[] {
  const lowercasePrompt = prompt.toLowerCase();
  const requirements: FunctionalRequirement[] = [];

  // Core functionality (always included)
  requirements.push({
    id: "fr-core-functionality",
    title: "Core Product Functionality",
    description: "Primary product capabilities and core user workflows",
    priority: "P0" as const,
    userStory:
      "As a user, I want to access the main product features seamlessly",
    acceptanceCriteria: [
      "Feature is accessible",
      "Performance meets standards",
      "User experience is intuitive",
    ],
  });

  // Enterprise/security requirements
  if (includesEnterpriseKeywords(lowercasePrompt)) {
    requirements.push({
      id: "fr-auth-security",
      title: "Authentication & Security",
      description: "Enterprise-grade authentication and security controls",
      priority: "P0" as const,
      userStory:
        "As an admin, I want to ensure secure access to enterprise features",
      acceptanceCriteria: [
        "SSO integration",
        "Role-based access control",
        "Audit logging",
      ],
    });
  }

  // Integration requirements
  if (includesIntegrationKeywords(lowercasePrompt)) {
    requirements.push({
      id: "fr-integrations",
      title: "Third-party Integrations",
      description: "Integration capabilities with existing enterprise systems",
      priority: "P1" as const,
      userStory:
        "As an organization, I want to integrate with our existing tools and workflows",
      acceptanceCriteria: [
        "API compatibility",
        "Data synchronization",
        "Error handling",
      ],
    });
  }

  return requirements;
}

// Generate success metrics based on prompt content
export function generateSuccessMetrics(prompt: string): SuccessMetric[] {
  const lowercasePrompt = prompt.toLowerCase();
  const metrics: SuccessMetric[] = [];

  // Core metrics (always included)
  metrics.push(
    {
      id: "sm-adoption",
      name: "User Adoption Rate",
      description: "Percentage of target users actively using the product",
      type: "adoption" as const,
      target: "80% adoption within 6 months",
      measurement: "Monthly Active Users / Total Enrolled Users",
      frequency: "Monthly",
    },
    {
      id: "sm-engagement",
      name: "Feature Engagement",
      description: "How frequently users engage with core features",
      type: "engagement" as const,
      target: "5+ sessions per user per week",
      measurement: "Average sessions per user per week",
      frequency: "Weekly",
    }
  );

  // Business metrics if relevant
  if (includesBusinessKeywords(lowercasePrompt)) {
    metrics.push({
      id: "sm-business-impact",
      name: "Business Impact",
      description: "Measurable business value and ROI from product adoption",
      type: "adoption" as const,
      target: "15% productivity improvement",
      measurement: "Time saved per user per week",
      frequency: "Quarterly",
    });
  }

  return metrics;
}

// Generate project milestones
export function generateMilestones(): Milestone[] {
  return [
    {
      id: "ms-research",
      title: "Research & Discovery",
      description:
        "User research, competitive analysis, and requirements gathering",
      phase: "research" as const,
      estimatedDate: "Month 1",
      deliverables: [
        "User research report",
        "Competitive analysis",
        "Technical requirements",
      ],
    },
    {
      id: "ms-design",
      title: "Design & Prototyping",
      description: "UI/UX design, user flows, and interactive prototypes",
      phase: "design" as const,
      estimatedDate: "Month 2",
      deliverables: ["Design system", "User flows", "Interactive prototypes"],
    },
    {
      id: "ms-mvp",
      title: "MVP Development",
      description: "Core functionality development and initial testing",
      phase: "development" as const,
      estimatedDate: "Month 3-4",
      deliverables: ["MVP release", "Core features", "Initial user testing"],
    },
    {
      id: "ms-launch",
      title: "Product Launch",
      description: "Full product release and market introduction",
      phase: "development" as const,
      estimatedDate: "Month 5-6",
      deliverables: [
        "Production release",
        "Launch campaign",
        "User onboarding",
      ],
    },
  ];
}

// Generate complete content outline
export function generateContentOutline(prompt: string): ContentOutline {
  return {
    functionalRequirements: generateFunctionalRequirements(prompt),
    successMetrics: generateSuccessMetrics(prompt),
    milestones: generateMilestones(),
  };
}

// Helper functions for keyword detection
function includesEnterpriseKeywords(prompt: string): boolean {
  return (
    prompt.includes("enterprise") ||
    prompt.includes("security") ||
    prompt.includes("admin")
  );
}

function includesIntegrationKeywords(prompt: string): boolean {
  return (
    prompt.includes("integration") ||
    prompt.includes("api") ||
    prompt.includes("connect")
  );
}

function includesBusinessKeywords(prompt: string): boolean {
  return (
    prompt.includes("business") ||
    prompt.includes("roi") ||
    prompt.includes("cost")
  );
}
