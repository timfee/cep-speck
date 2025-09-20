"use client";

import {
  Building2,
  Shield,
  Link,
  Headphones,
  Zap,
  CheckCircle,
} from "lucide-react";

import React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EnterpriseParameters } from "@/types/workflow";

import {
  TARGET_SKU_OPTIONS,
  DEPLOYMENT_MODEL_OPTIONS,
  SECURITY_REQUIREMENTS_OPTIONS,
  INTEGRATION_OPTIONS,
  SUPPORT_LEVEL_OPTIONS,
} from "./components/enterpriseOptions";

import { MultiSelectSection } from "./components/MultiSelectSection";
import { RadioGroupSection } from "./components/RadioGroupSection";

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
        onChange={(value) =>
          onChange({
            ...parameters,
            targetSku: value as
              | "premium"
              | "enterprise"
              | "education"
              | "government",
          })
        }
        columns={2}
      />

      <RadioGroupSection
        title="Deployment Model"
        icon={Zap}
        iconColor="text-green-600"
        value={parameters.deploymentModel}
        options={DEPLOYMENT_MODEL_OPTIONS}
        onChange={(value) =>
          onChange({
            ...parameters,
            deploymentModel: value as "cloud" | "hybrid" | "on-premise",
          })
        }
        columns={3}
      />

      <MultiSelectSection
        title="Security Requirements"
        icon={Shield}
        iconColor="text-red-600"
        selectedValues={parameters.securityRequirements}
        options={SECURITY_REQUIREMENTS_OPTIONS}
        onToggle={(value) => {
          const current = parameters.securityRequirements;
          const updated = current.includes(value as (typeof current)[0])
            ? current.filter((item) => item !== value)
            : [...current, value as (typeof current)[0]];
          onChange({ ...parameters, securityRequirements: updated });
        }}
      />

      <MultiSelectSection
        title="Required Integrations"
        icon={Link}
        iconColor="text-purple-600"
        selectedValues={parameters.integrations}
        options={INTEGRATION_OPTIONS}
        onToggle={(value) => {
          const current = parameters.integrations;
          const updated = current.includes(value as (typeof current)[0])
            ? current.filter((item) => item !== value)
            : [...current, value as (typeof current)[0]];
          onChange({ ...parameters, integrations: updated });
        }}
      />

      <div className="grid grid-cols-2 gap-6">
        <RadioGroupSection
          title="Support Level"
          icon={Headphones}
          iconColor="text-orange-600"
          value={parameters.supportLevel}
          options={SUPPORT_LEVEL_OPTIONS}
          onChange={(value) =>
            onChange({
              ...parameters,
              supportLevel: value as "standard" | "premium" | "enterprise",
            })
          }
        />

        <RadioGroupSection
          title="Rollout Strategy"
          icon={Zap}
          iconColor="text-yellow-600"
          value={parameters.rolloutStrategy}
          options={[
            {
              value: "pilot",
              label: "Pilot Program",
              desc: "Small group testing",
            },
            {
              value: "phased",
              label: "Phased Rollout",
              desc: "Gradual deployment",
            },
            {
              value: "full-deployment",
              label: "Full Deployment",
              desc: "Organization-wide launch",
            },
          ]}
          onChange={(value) =>
            onChange({
              ...parameters,
              rolloutStrategy: value as "pilot" | "phased" | "full-deployment",
            })
          }
        />
      </div>

      <Card className="p-4 bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Configuration Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Target SKU:</strong> {parameters.targetSku}
          </div>
          <div>
            <strong>Deployment:</strong> {parameters.deploymentModel}
          </div>
          <div>
            <strong>Security:</strong>{" "}
            {parameters.securityRequirements.length > 0
              ? parameters.securityRequirements.join(", ")
              : "None selected"}
          </div>
          <div>
            <strong>Integrations:</strong>{" "}
            {parameters.integrations.length > 0
              ? parameters.integrations.join(", ")
              : "None selected"}
          </div>
          <div>
            <strong>Support:</strong> {parameters.supportLevel}
          </div>
          <div>
            <strong>Rollout:</strong> {parameters.rolloutStrategy}
          </div>
        </div>
      </Card>
    </div>
  );
}
