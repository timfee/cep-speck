"use client";

import { Building2, Headphones, Link, Shield, Zap } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";
import type { EnterpriseParameters } from "@/types/workflow";

import {
  DEPLOYMENT_MODEL_OPTIONS,
  INTEGRATION_OPTIONS,
  ROLLOUT_STRATEGY_OPTIONS,
  SECURITY_REQUIREMENTS_OPTIONS,
  SUPPORT_LEVEL_OPTIONS,
  TARGET_SKU_OPTIONS,
} from "./components/enterprise-options";

import { MultiSelectSection } from "./components/multi-select-section";
import { RadioGroupSection } from "./components/radio-group-section";
import { ConfigurationSummary } from "./configuration-summary";

import {
  createDeploymentModelHandler,
  createIntegrationToggleHandler,
  createRolloutStrategyHandler,
  createSecurityToggleHandler,
  createSupportLevelHandler,
  createTargetSkuHandler,
} from "./enterprise-parameters-handlers";

interface EnterpriseParametersStepProps {
  parameters: EnterpriseParameters;
  onChange: (parameters: EnterpriseParameters) => void;
  className?: string;
}

export function EnterpriseParametersStep({
  parameters,
  onChange,
  className,
}: EnterpriseParametersStepProps) {
  // Create handlers
  const handleTargetSkuChange = createTargetSkuHandler(parameters, onChange);
  const handleDeploymentModelChange = createDeploymentModelHandler(
    parameters,
    onChange
  );
  const handleSupportLevelChange = createSupportLevelHandler(
    parameters,
    onChange
  );
  const handleRolloutStrategyChange = createRolloutStrategyHandler(
    parameters,
    onChange
  );
  const handleSecurityToggle = createSecurityToggleHandler(
    parameters,
    onChange
  );
  const handleIntegrationToggle = createIntegrationToggleHandler(
    parameters,
    onChange
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Enterprise Configuration</h2>
        <p className="text-muted-foreground">
          Configure enterprise-specific parameters that will influence the PRD
          structure and content.
        </p>
      </div>

      <RadioGroupSection
        title="Target SKU"
        icon={Building2}
        iconColor="text-blue-600"
        value={parameters.targetSku}
        options={TARGET_SKU_OPTIONS}
        onChange={handleTargetSkuChange}
        columns={2}
      />

      <RadioGroupSection
        title="Deployment Model"
        icon={Zap}
        iconColor="text-green-600"
        value={parameters.deploymentModel}
        options={DEPLOYMENT_MODEL_OPTIONS}
        onChange={handleDeploymentModelChange}
        columns={3}
      />

      <MultiSelectSection
        title="Security Requirements"
        icon={Shield}
        iconColor="text-red-600"
        selectedValues={parameters.securityRequirements}
        options={SECURITY_REQUIREMENTS_OPTIONS}
        onToggle={handleSecurityToggle}
      />

      <MultiSelectSection
        title="Required Integrations"
        icon={Link}
        iconColor="text-purple-600"
        selectedValues={parameters.integrations}
        options={INTEGRATION_OPTIONS}
        onToggle={handleIntegrationToggle}
      />

      <div className="grid grid-cols-2 gap-6">
        <RadioGroupSection
          title="Support Level"
          icon={Headphones}
          iconColor="text-orange-600"
          value={parameters.supportLevel}
          options={SUPPORT_LEVEL_OPTIONS}
          onChange={handleSupportLevelChange}
        />

        <RadioGroupSection
          title="Rollout Strategy"
          icon={Zap}
          iconColor="text-yellow-600"
          value={parameters.rolloutStrategy}
          options={ROLLOUT_STRATEGY_OPTIONS}
          onChange={handleRolloutStrategyChange}
        />
      </div>

      <ConfigurationSummary parameters={parameters} />
    </div>
  );
}
