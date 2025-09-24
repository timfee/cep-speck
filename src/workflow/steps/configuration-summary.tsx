/**
 * Enterprise configuration summary component
 */

import { CheckCircle } from "lucide-react";
import React from "react";

import { Card } from "@/components/ui/card";
import type { EnterpriseParameters } from "@/types/workflow";

interface ConfigurationSummaryProps {
  parameters: EnterpriseParameters;
}

export function ConfigurationSummary({
  parameters,
}: ConfigurationSummaryProps) {
  return (
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
  );
}
