import type {
  ContentOutline,
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  OutlineMetadata,
  StructuredWorkflowState,
  SuccessMetric,
  SuccessMetricSchema,
} from "@/types/workflow";

const createMetadataFixture = (): OutlineMetadata => ({
  projectName: "Project Atlas",
  projectTagline: "Accelerating enterprise onboarding",
  problemStatement: "Manual provisioning slows adoption.",
  primaryPersona: {
    presetId: "it-admin",
    customValue: "",
    useCustom: false,
  },
  secondaryPersonas: { presetIds: ["security-analyst"], customValues: [] },
  valuePropositions: { presetIds: ["faster-onboarding"], customValues: [] },
  targetUsers: { presetIds: ["enterprise-admin"], customValues: [] },
  platforms: { presetIds: ["web"], customValues: [] },
  regions: { presetIds: ["north-america"], customValues: [] },
  strategicRisks: { presetIds: [], customValues: ["Change management"] },
  notes: "Focus on compliance and rollout velocity.",
});

const createFunctionalRequirementFixture = (): FunctionalRequirement => ({
  id: "fr-existing",
  title: "Support enterprise SSO",
  description: "Provide secure SSO integration for enterprise tenants.",
  priority: "P1",
  userStory: "As an IT admin, I want to configure SSO to centralize access.",
  acceptanceCriteria: ["Supports SAML and OIDC"],
  dependencies: ["auth-service"],
  estimatedEffort: "3 sprints",
});

const createSuccessMetricFixture = (): SuccessMetric => ({
  id: "sm-existing",
  name: "Tenant activation rate",
  description: "Percentage of provisioned tenants completing activation.",
  type: "engagement",
  target: "85%",
  measurement: "Weekly cohort analysis",
  frequency: "Weekly",
  owner: "Growth PM",
});

const createMilestoneFixture = (): Milestone => ({
  id: "ms-existing",
  title: "Complete security review",
  description: "Finalize enterprise security assessment and approvals.",
  phase: "design",
  estimatedDate: "2024-06-15",
  dependencies: ["risk-assessment"],
  deliverables: ["Security checklist", "Vendor questionnaire"],
});

const createCustomerJourneyFixture = (): CustomerJourney => ({
  id: "cjs-existing",
  title: "IT admin configures SSO",
  role: "IT Administrator",
  goal: "Enable secure SSO for all employees",
  successCriteria: "Employees authenticate through SSO without issues",
  steps: [
    { id: "cjs-step-1", description: "Open enterprise admin console" },
    { id: "cjs-step-2", description: "Configure identity provider" },
  ],
  painPoints: ["Approval delays"],
});

const createMetricSchemaFixture = (): SuccessMetricSchema => ({
  id: "metric-schema-existing",
  title: "Activation metrics",
  description: "Schema capturing activation funnel metrics",
  fields: [
    {
      id: "metric-field-1",
      name: "Activated accounts",
      description: "Number of accounts that completed activation",
      dataType: "number",
      required: true,
      allowedValues: undefined,
      sourceSystem: "Snowflake",
    },
  ],
});

export const createContentOutlineFixture = (): ContentOutline => ({
  metadata: createMetadataFixture(),
  functionalRequirements: [createFunctionalRequirementFixture()],
  successMetrics: [createSuccessMetricFixture()],
  milestones: [createMilestoneFixture()],
  customerJourneys: [createCustomerJourneyFixture()],
  metricSchemas: [createMetricSchemaFixture()],
  executiveSummary: {
    problemStatement: "Enterprise onboarding is too slow.",
    proposedSolution: "Automate provisioning workflows.",
    businessValue: "Accelerates revenue recognition.",
    targetUsers: "Global enterprises",
  },
});

export const createWorkflowStateFixture = (): StructuredWorkflowState => ({
  currentStep: "outline",
  initialPrompt: "Draft enterprise onboarding PRD",
  contentOutline: createContentOutlineFixture(),
  enterpriseParameters: {
    targetSku: "enterprise",
    deploymentModel: "cloud",
    securityRequirements: ["sso", "compliance"],
    integrations: ["active-directory"],
    supportLevel: "enterprise",
    rolloutStrategy: "phased",
  },
  selectedSections: [],
  sectionContents: {},
  sectionOrder: [],
  finalPrd: "",
  progress: {
    step: 2,
    totalSteps: 5,
    stepName: "outline",
    completion: 25,
    canGoBack: true,
    canGoNext: true,
  },
  isLoading: false,
  error: undefined,
});
