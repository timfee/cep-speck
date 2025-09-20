// Enterprise parameter option constants

export const TARGET_SKU_OPTIONS: Array<{
  value: string;
  label: string;
  desc: string;
}> = [
  {
    value: "premium",
    label: "Chrome Enterprise Premium",
    desc: "Advanced security and management",
  },
  {
    value: "enterprise",
    label: "Chrome Enterprise Core",
    desc: "Basic enterprise features",
  },
  {
    value: "education",
    label: "Chrome Education Plus",
    desc: "Educational institutions",
  },
  {
    value: "government",
    label: "Chrome Enterprise for Government",
    desc: "Government compliance",
  },
];

export const DEPLOYMENT_MODEL_OPTIONS: Array<{
  value: string;
  label: string;
  desc: string;
}> = [
  {
    value: "cloud",
    label: "Cloud-First",
    desc: "Google Cloud managed",
  },
  {
    value: "hybrid",
    label: "Hybrid",
    desc: "Cloud + on-premise",
  },
  {
    value: "on-premise",
    label: "On-Premise",
    desc: "Self-hosted",
  },
];

export const SECURITY_REQUIREMENTS_OPTIONS: Array<{
  value: string;
  label: string;
  desc: string;
}> = [
  {
    value: "sso",
    label: "Single Sign-On (SSO)",
    desc: "SAML/OIDC authentication",
  },
  {
    value: "dlp",
    label: "Data Loss Prevention",
    desc: "Content protection policies",
  },
  {
    value: "compliance",
    label: "Compliance",
    desc: "SOC 2, HIPAA, FedRAMP",
  },
  {
    value: "audit",
    label: "Audit & Logging",
    desc: "Security event monitoring",
  },
];

export const INTEGRATION_OPTIONS: Array<{
  value: string;
  label: string;
  desc: string;
}> = [
  {
    value: "active-directory",
    label: "Active Directory",
    desc: "Microsoft AD integration",
  },
  {
    value: "okta",
    label: "Okta",
    desc: "Identity management platform",
  },
  {
    value: "salesforce",
    label: "Salesforce",
    desc: "CRM integration",
  },
  {
    value: "workspace",
    label: "Google Workspace",
    desc: "Productivity suite",
  },
];

export const SUPPORT_LEVEL_OPTIONS: Array<{
  value: string;
  label: string;
  desc: string;
}> = [
  {
    value: "standard",
    label: "Standard Support",
    desc: "Business hours coverage",
  },
  {
    value: "premium",
    label: "Premium Support",
    desc: "24/7 priority support",
  },
  {
    value: "enterprise",
    label: "Enterprise Support",
    desc: "Dedicated success manager",
  },
];
