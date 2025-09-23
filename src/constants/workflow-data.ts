/**
 * Static workflow data and constants
 */

import type {
  SectionDefinition,
  EnterpriseParameters,
} from "@/types/workflow-types";

export const AVAILABLE_SECTIONS: SectionDefinition[] = [
  {
    id: "executive-summary",
    title: "Executive Summary",
    description: "High-level overview of the product and business case",
    icon: "FileText",
    estimatedWords: 200,
    required: true,
    prompt:
      "Write a concise executive summary covering the key product overview, business objectives, and expected outcomes.",
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    description: "Target market, competition, and opportunity assessment",
    icon: "TrendingUp",
    estimatedWords: 300,
    required: false,
    prompt:
      "Analyze the target market, competitive landscape, and market opportunity for this product.",
  },
  {
    id: "user-personas",
    title: "User Personas",
    description: "Detailed user personas and target audience profiles",
    icon: "Users",
    estimatedWords: 400,
    required: false,
    prompt:
      "Define detailed user personas, including demographics, behaviors, needs, and pain points.",
  },
  {
    id: "functional-requirements",
    title: "Functional Requirements",
    description: "Core functionality and feature specifications",
    icon: "Settings",
    estimatedWords: 500,
    required: true,
    prompt:
      "Detail the core functional requirements, features, and capabilities of the product.",
  },
  {
    id: "technical-architecture",
    title: "Technical Architecture",
    description: "System architecture, tech stack, and infrastructure",
    icon: "Code",
    estimatedWords: 400,
    required: false,
    prompt:
      "Outline the technical architecture, technology choices, and system design considerations.",
  },
  {
    id: "success-metrics",
    title: "Success Metrics",
    description: "Key performance indicators and measurement criteria",
    icon: "BarChart3",
    estimatedWords: 300,
    required: true,
    prompt:
      "Define success metrics, KPIs, and measurement criteria for evaluating product success.",
  },
  {
    id: "timeline-milestones",
    title: "Timeline & Milestones",
    description: "Project timeline, phases, and key milestones",
    icon: "Calendar",
    estimatedWords: 350,
    required: false,
    prompt:
      "Create a project timeline with key milestones, phases, and deliverable schedules.",
  },
  {
    id: "risk-mitigation",
    title: "Risk Assessment",
    description: "Potential risks, challenges, and mitigation strategies",
    icon: "Shield",
    estimatedWords: 300,
    required: false,
    prompt:
      "Identify potential risks, challenges, and corresponding mitigation strategies.",
  },
  {
    id: "stakeholder-impact",
    title: "Stakeholder Impact",
    description: "Impact on different stakeholders and change management",
    icon: "Users",
    estimatedWords: 250,
    required: false,
    prompt:
      "Analyze the impact on various stakeholders and outline change management considerations.",
  },
];

export const WORKFLOW_STEPS = [
  {
    id: "idea",
    name: "Idea Capture",
    description: "Describe your product concept",
  },
  {
    id: "outline",
    name: "Content Outline",
    description: "Review functional requirements & metrics",
  },
  {
    id: "parameters",
    name: "Enterprise Settings",
    description: "Configure deployment & security",
  },
  {
    id: "generate",
    name: "Generate PRD",
    description: "Create final document",
  },
  {
    id: "complete",
    name: "PRD Complete",
    description: "Review generated document",
  },
] as const;

// Default enterprise parameters
export const DEFAULT_ENTERPRISE_PARAMETERS: EnterpriseParameters = {
  targetSku: "premium",
  deploymentModel: "cloud",
  securityRequirements: [],
  integrations: [],
  supportLevel: "standard",
  rolloutStrategy: "pilot",
};
