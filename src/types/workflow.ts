// Workflow types for structured PRD input pipeline

export type WorkflowStep =
  | "idea"
  | "outline"
  | "parameters"
  | "generate"
  | "complete";

// Content outline structures
export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  priority: "P0" | "P1" | "P2";
  userStory?: string;
  acceptanceCriteria?: string[];
  dependencies?: string[];
  estimatedEffort?: string;
}

export interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  type: "engagement" | "adoption" | "performance" | "business";
  target?: string;
  measurement?: string;
  frequency?: string;
  owner?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  phase:
    | "research"
    | "design"
    | "development"
    | "testing"
    | "launch"
    | "post-launch";
  estimatedDate?: string;
  dependencies?: string[];
  deliverables?: string[];
}

export interface ContentOutline {
  functionalRequirements: FunctionalRequirement[];
  successMetrics: SuccessMetric[];
  milestones: Milestone[];
  executiveSummary?: {
    problemStatement: string;
    proposedSolution: string;
    businessValue: string;
    targetUsers: string;
  };
}

// Enterprise-specific parameter options
export interface EnterpriseParameters {
  targetSku: "premium" | "enterprise" | "education" | "government";
  deploymentModel: "cloud" | "hybrid" | "on-premise";
  securityRequirements: ("sso" | "dlp" | "compliance" | "audit")[];
  integrations: ("active-directory" | "okta" | "salesforce" | "workspace")[];
  supportLevel: "standard" | "premium" | "enterprise";
  rolloutStrategy: "pilot" | "phased" | "full-deployment";
}

export interface SectionDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedWords: number;
  required: boolean;
  prompt?: string;
  content?: string;
  order?: number;
}

export interface WorkflowProgress {
  step: number;
  totalSteps: number;
  stepName: string;
  completion: number;
  timeEstimate?: number;
  canGoBack: boolean;
  canGoNext: boolean;
}

export interface StructuredWorkflowState {
  currentStep: WorkflowStep;
  initialPrompt: string;
  contentOutline: ContentOutline;
  enterpriseParameters: EnterpriseParameters;
  selectedSections: string[];
  sectionContents: Record<string, string>;
  sectionOrder: string[];
  finalPrd: string;
  progress: WorkflowProgress;
  isLoading: boolean;
  error?: string;
}

export interface SectionStructureResponse {
  sections: SectionDefinition[];
  estimatedTotalWords: number;
  confidence: number;
}

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
    id: "feature-requirements",
    title: "Feature Requirements",
    description: "Detailed feature specifications and user stories",
    icon: "List",
    estimatedWords: 500,
    required: true,
    prompt:
      "Define detailed feature requirements including user stories, acceptance criteria, and technical specifications.",
  },
  {
    id: "technical-architecture",
    title: "Technical Architecture",
    description: "System design and technical implementation approach",
    icon: "Code",
    estimatedWords: 400,
    required: false,
    prompt:
      "Outline the technical architecture, system design patterns, and implementation approach.",
  },
  {
    id: "success-metrics",
    title: "Success Metrics",
    description: "KPIs, measurement criteria, and success indicators",
    icon: "BarChart",
    estimatedWords: 200,
    required: true,
    prompt:
      "Define key success metrics, measurement methodologies, and success criteria for the product.",
  },
  {
    id: "timeline-milestones",
    title: "Timeline & Milestones",
    description: "Project timeline, phases, and key deliverable milestones",
    icon: "Calendar",
    estimatedWords: 250,
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
