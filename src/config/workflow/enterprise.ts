import type { EnterpriseParameters } from "@/types/workflow";

export const DEFAULT_ENTERPRISE_PARAMETERS: EnterpriseParameters = {
  targetSku: "premium",
  deploymentModel: "cloud",
  securityRequirements: [],
  integrations: [],
  supportLevel: "standard",
  rolloutStrategy: "pilot",
};
