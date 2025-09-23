/**
 * Enumeration data arrays extracted from outline-enumerations.ts for complexity management
 */

export interface OutlineOption {
  id: string;
  label: string;
  description?: string;
}

export const PRIMARY_PERSONA_OPTIONS: OutlineOption[] = [
  {
    id: "security-administrator",
    label: "Security administrator",
    description:
      "Owns policy management, risk mitigation, and enterprise security posture.",
  },
  {
    id: "it-operations-lead",
    label: "IT operations lead",
    description:
      "Keeps infrastructure available, deploys updates, and maintains fleet health.",
  },
  {
    id: "compliance-officer",
    label: "Compliance officer",
    description:
      "Ensures regulatory alignment and drives audit readiness across programs.",
  },
  {
    id: "product-manager",
    label: "Product manager",
    description:
      "Defines product outcomes, prioritizes roadmaps, and coordinates delivery teams.",
  },
  {
    id: "support-manager",
    label: "Support manager",
    description:
      "Oversees frontline agents, manages escalation paths, and measures customer impact.",
  },
];

export const SECONDARY_PERSONA_OPTIONS: OutlineOption[] = [
  { id: "trust-and-safety-analyst", label: "Trust & Safety analyst" },
  { id: "secops-analyst", label: "SecOps analyst" },
  { id: "compliance-specialist", label: "Compliance specialist" },
  { id: "it-help-desk", label: "IT help desk technician" },
  { id: "executive-stakeholder", label: "Executive stakeholder" },
];

export const VALUE_PROPOSITION_OPTIONS: OutlineOption[] = [
  { id: "faster-detection", label: "Faster detection & response" },
  { id: "reduced-operational-costs", label: "Reduced operational costs" },
  {
    id: "improved-end-user-experience",
    label: "Improved end-user experience",
  },
  { id: "stronger-compliance", label: "Stronger compliance posture" },
  {
    id: "seamless-integration",
    label: "Seamless integration with existing tools",
  },
];

export const TARGET_USER_OPTIONS: OutlineOption[] = [
  { id: "security-operations", label: "Security operations teams" },
  { id: "trust-and-safety", label: "Trust & Safety reviewers" },
  { id: "developers", label: "Developers" },
  { id: "executives", label: "Executive leadership" },
  { id: "customer-support", label: "Customer support agents" },
];

export const PLATFORM_OPTIONS: OutlineOption[] = [
  { id: "chrome", label: "Chrome" },
  { id: "edge", label: "Microsoft Edge" },
  { id: "firefox", label: "Firefox" },
  { id: "safari", label: "Safari" },
  { id: "windows", label: "Windows" },
  { id: "macos", label: "macOS" },
  { id: "linux", label: "Linux" },
  { id: "android", label: "Android" },
  { id: "ios", label: "iOS" },
];

export const REGION_OPTIONS: OutlineOption[] = [
  { id: "north-america", label: "North America" },
  { id: "latin-america", label: "Latin America" },
  { id: "europe", label: "Europe" },
  { id: "middle-east", label: "Middle East" },
  { id: "africa", label: "Africa" },
  { id: "asia-pacific", label: "Asia Pacific" },
  { id: "japan", label: "Japan" },
  { id: "australia-new-zealand", label: "Australia & New Zealand" },
];

export const STRATEGIC_RISK_OPTIONS: OutlineOption[] = [
  {
    id: "adoption",
    label: "Adoption risk",
    description:
      "Uncertainty that target users will embrace the solution or change workflows.",
  },
  {
    id: "operational",
    label: "Operational risk",
    description:
      "Dependencies on support, training, or organizational readiness may fail.",
  },
  {
    id: "security",
    label: "Security risk",
    description:
      "Potential vulnerabilities, threat coverage gaps, or regulatory exposure.",
  },
  {
    id: "compliance",
    label: "Compliance risk",
    description:
      "Misalignment with legal frameworks or certification requirements.",
  },
  {
    id: "competitive",
    label: "Competitive risk",
    description:
      "Market alternatives may erode differentiation or pricing power.",
  },
];

// Metadata form configuration for simplified UI components
export interface MetadataFieldConfig {
  key: string;
  label: string;
  options: OutlineOption[];
  hint?: string;
}

export const METADATA_LIST_FIELDS: MetadataFieldConfig[] = [
  {
    key: "secondaryPersonas",
    label: "Secondary Personas",
    hint: "Select supporting personas that influence delivery",
    options: SECONDARY_PERSONA_OPTIONS,
  },
  {
    key: "valuePropositions",
    label: "Value Propositions",
    hint: "Highlight the differentiating benefits for the drafter",
    options: VALUE_PROPOSITION_OPTIONS,
  },
  {
    key: "targetUsers",
    label: "Target Users",
    hint: "Role archetypes or segments expected to adopt the solution",
    options: TARGET_USER_OPTIONS,
  },
  {
    key: "platforms",
    label: "Supported Platforms",
    hint: "Browsers, operating systems, or key surfaces to prioritize",
    options: PLATFORM_OPTIONS,
  },
  {
    key: "regions",
    label: "Target Regions",
    hint: "Geographies in scope for the release or pilot",
    options: REGION_OPTIONS,
  },
  {
    key: "strategicRisks",
    label: "Strategic Risks",
    hint: "Critical risks the drafter should monitor",
    options: STRATEGIC_RISK_OPTIONS,
  },
];
