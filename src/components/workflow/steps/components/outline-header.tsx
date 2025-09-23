import { Wand2 } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface OutlineHeaderProps {
  initialPrompt: string;
  outlineSummary: {
    totalItems: number;
    functionalRequirements: number;
    successMetrics: number;
    milestones: number;
    customerJourneys: number;
    metricSchemas: number;
  };
  onRegenerateOutline: () => void;
  isLoading: boolean;
}

export function OutlineHeader({
  initialPrompt,
  outlineSummary,
  onRegenerateOutline,
  isLoading,
}: OutlineHeaderProps) {
  return (
    <>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Review Content Outline</h2>
        <p className="text-muted-foreground">
          AI has generated functional requirements, metrics, milestones, and
          customer journeys based on your product description. Review and
          customize these structured sections before generating the final PRD.
        </p>
      </div>

      {/* Summary card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wand2 className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            AI-Generated Content Outline
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={onRegenerateOutline}
            disabled={isLoading}
          >
            <Wand2
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Regenerate
          </Button>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
            <strong>Based on:</strong> &quot;{initialPrompt.slice(0, 100)}
            {initialPrompt.length > 100 ? "..." : ""}&quot;
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {outlineSummary.totalItems} total items
            </Badge>
            <Badge variant="outline">
              {outlineSummary.functionalRequirements} functional requirements
            </Badge>
            <Badge variant="outline">
              {outlineSummary.successMetrics} metrics
            </Badge>
            <Badge variant="outline">
              {outlineSummary.milestones} milestones
            </Badge>
            <Badge variant="outline">
              {outlineSummary.customerJourneys} customer journeys
            </Badge>
            <Badge variant="outline">
              {outlineSummary.metricSchemas} metric schemas
            </Badge>
          </div>
        </div>
      </Card>
    </>
  );
}
