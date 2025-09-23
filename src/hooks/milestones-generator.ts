/**
 * Project milestones generation
 */

import type { Milestone } from "@/types/workflow";

/**
 * Generate standard project milestones
 */
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
