// Enterprise workflow parameter types

export interface EnterpriseParameters {
  targetSku: "premium" | "enterprise" | "education" | "government";
  deploymentModel: "cloud" | "hybrid" | "on-premise";
  securityRequirements: ("sso" | "dlp" | "compliance" | "audit")[];
  integrations: ("active-directory" | "okta" | "salesforce" | "workspace")[];
  supportLevel: "standard" | "premium" | "enterprise";
  rolloutStrategy: "pilot" | "phased" | "full-deployment";
}
