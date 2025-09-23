/**
 * Enterprise parameters update handlers
 */

import type { EnterpriseParameters } from "@/types/workflow";

/**
 * Create handler for updating target SKU
 */
export function createTargetSkuHandler(
  parameters: EnterpriseParameters,
  onChange: (params: EnterpriseParameters) => void
) {
  return (value: string) =>
    onChange({
      ...parameters,
      targetSku: value as "premium" | "enterprise" | "education" | "government",
    });
}

/**
 * Create handler for updating deployment model
 */
export function createDeploymentModelHandler(
  parameters: EnterpriseParameters,
  onChange: (params: EnterpriseParameters) => void
) {
  return (value: string) =>
    onChange({
      ...parameters,
      deploymentModel: value as "cloud" | "hybrid" | "on-premise",
    });
}

/**
 * Create handler for updating support level
 */
export function createSupportLevelHandler(
  parameters: EnterpriseParameters,
  onChange: (params: EnterpriseParameters) => void
) {
  return (value: string) =>
    onChange({
      ...parameters,
      supportLevel: value as "standard" | "premium" | "enterprise",
    });
}

/**
 * Create handler for updating rollout strategy
 */
export function createRolloutStrategyHandler(
  parameters: EnterpriseParameters,
  onChange: (params: EnterpriseParameters) => void
) {
  return (value: string) =>
    onChange({
      ...parameters,
      rolloutStrategy: value as "pilot" | "phased" | "full-deployment",
    });
}

/**
 * Create toggle handler for security requirements
 */
export function createSecurityToggleHandler(
  parameters: EnterpriseParameters,
  onChange: (params: EnterpriseParameters) => void
) {
  return (value: string) => {
    const current = parameters.securityRequirements;
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...parameters, securityRequirements: updated });
  };
}

/**
 * Create toggle handler for integrations
 */
export function createIntegrationToggleHandler(
  parameters: EnterpriseParameters,
  onChange: (params: EnterpriseParameters) => void
) {
  return (value: string) => {
    const current = parameters.integrations;
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...parameters, integrations: updated });
  };
}
