"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  Building2,
  Shield,
  Link,
  Headphones,
  Zap,
  CheckCircle,
} from "lucide-react";
import type { EnterpriseParameters } from "@/types/workflow";

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
  const updateParameter = <K extends keyof EnterpriseParameters>(
    key: K,
    value: EnterpriseParameters[K]
  ) => {
    onChange({ ...parameters, [key]: value });
  };

  const toggleArrayParameter = (
    key: "securityRequirements" | "integrations",
    value: string
  ) => {
    const currentArray = parameters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    onChange({ ...parameters, [key]: newArray });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Enterprise Configuration</h2>
        <p className="text-muted-foreground">
          Configure enterprise-specific parameters that will influence the PRD
          structure and content.
        </p>
      </div>

      {/* Target SKU */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Target SKU</h3>
        </div>

        <RadioGroup
          value={parameters.targetSku}
          onValueChange={(
            value: "premium" | "enterprise" | "education" | "government"
          ) => updateParameter("targetSku", value)}
          className="grid grid-cols-2 gap-4"
        >
          {[
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
          ].map(option => (
            <div
              key={option.value}
              className="flex items-center space-x-2 border rounded-lg p-3"
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <label htmlFor={option.value} className="flex-1 cursor-pointer">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">
                  {option.desc}
                </div>
              </label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      {/* Deployment Model */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Deployment Model</h3>
        </div>

        <RadioGroup
          value={parameters.deploymentModel}
          onValueChange={(value: "cloud" | "hybrid" | "on-premise") =>
            updateParameter("deploymentModel", value)
          }
          className="grid grid-cols-3 gap-4"
        >
          {[
            {
              value: "cloud",
              label: "Cloud-First",
              desc: "Google Cloud managed",
            },
            { value: "hybrid", label: "Hybrid", desc: "Cloud + on-premise" },
            { value: "on-premise", label: "On-Premise", desc: "Self-hosted" },
          ].map(option => (
            <div
              key={option.value}
              className="flex items-center space-x-2 border rounded-lg p-3"
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <label htmlFor={option.value} className="flex-1 cursor-pointer">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">
                  {option.desc}
                </div>
              </label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      {/* Security Requirements */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold">Security Requirements</h3>
          {parameters.securityRequirements.length > 0 && (
            <Badge variant="outline">
              {parameters.securityRequirements.length} selected
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
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
          ].map(option => (
            <div
              key={option.value}
              className={cn(
                "border rounded-lg p-3 cursor-pointer transition-all",
                parameters.securityRequirements.includes(
                  option.value as "sso" | "dlp" | "compliance" | "audit"
                )
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/50"
              )}
              onClick={() =>
                toggleArrayParameter("securityRequirements", option.value)
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.desc}
                  </div>
                </div>
                {parameters.securityRequirements.includes(
                  option.value as "sso" | "dlp" | "compliance" | "audit"
                ) && <CheckCircle className="h-4 w-4 text-primary" />}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Integrations */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Link className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Required Integrations</h3>
          {parameters.integrations.length > 0 && (
            <Badge variant="outline">
              {parameters.integrations.length} selected
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
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
          ].map(option => (
            <div
              key={option.value}
              className={cn(
                "border rounded-lg p-3 cursor-pointer transition-all",
                parameters.integrations.includes(
                  option.value as
                    | "active-directory"
                    | "okta"
                    | "salesforce"
                    | "workspace"
                )
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/50"
              )}
              onClick={() => toggleArrayParameter("integrations", option.value)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.desc}
                  </div>
                </div>
                {parameters.integrations.includes(
                  option.value as
                    | "active-directory"
                    | "okta"
                    | "salesforce"
                    | "workspace"
                ) && <CheckCircle className="h-4 w-4 text-primary" />}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Support Level & Rollout Strategy */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Support Level</h3>
          </div>

          <RadioGroup
            value={parameters.supportLevel}
            onValueChange={(value: "standard" | "premium" | "enterprise") =>
              updateParameter("supportLevel", value)
            }
            className="space-y-2"
          >
            {[
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
                desc: "Dedicated support team",
              },
            ].map(option => (
              <div
                key={option.value}
                className="flex items-center space-x-2 border rounded-lg p-3"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`support-${option.value}`}
                />
                <label
                  htmlFor={`support-${option.value}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.desc}
                  </div>
                </label>
              </div>
            ))}
          </RadioGroup>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Rollout Strategy</h3>
          </div>

          <RadioGroup
            value={parameters.rolloutStrategy}
            onValueChange={(value: "pilot" | "phased" | "full-deployment") =>
              updateParameter("rolloutStrategy", value)
            }
            className="space-y-2"
          >
            {[
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
            ].map(option => (
              <div
                key={option.value}
                className="flex items-center space-x-2 border rounded-lg p-3"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`rollout-${option.value}`}
                />
                <label
                  htmlFor={`rollout-${option.value}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.desc}
                  </div>
                </label>
              </div>
            ))}
          </RadioGroup>
        </Card>
      </div>

      {/* Configuration Summary */}
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
