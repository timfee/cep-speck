"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionTypeSelector } from '@/components/workflow/SectionTypeSelector';
import { Sparkles, RefreshCw } from 'lucide-react';
import type { SectionDefinition } from '@/types/workflow';

interface StructureReviewStepProps {
  initialPrompt: string;
  suggestedSections: SectionDefinition[];
  selectedSections: string[];
  onSelectedSectionsChange: (sections: string[]) => void;
  onRegenerateStructure: () => void;
  isLoading?: boolean;
}

export function StructureReviewStep({
  initialPrompt,
  suggestedSections,
  selectedSections,
  onSelectedSectionsChange,
  onRegenerateStructure,
  isLoading = false
}: StructureReviewStepProps) {
  const totalSelectedWords = suggestedSections
    .filter(section => selectedSections.includes(section.id))
    .reduce((total, section) => total + section.estimatedWords, 0);

  const requiredSections = suggestedSections.filter(s => s.required);
  // const optionalSections = suggestedSections.filter(s => !s.required);
  const selectedRequiredCount = requiredSections.filter(s => selectedSections.includes(s.id)).length;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Review Suggested Structure</h2>
        <p className="text-muted-foreground">
          Based on your product description, we&apos;ve suggested these sections for your PRD. 
          Customize the selection to fit your needs.
        </p>
      </div>

      {/* Summary card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Generated Structure
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerateStructure}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
            <strong>Based on:</strong> &quot;{initialPrompt.slice(0, 100)}{initialPrompt.length > 100 ? '...' : ''}&quot;
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {selectedSections.length} sections selected
            </Badge>
            <Badge variant="outline">
              ~{totalSelectedWords} total words
            </Badge>
            <Badge variant={selectedRequiredCount === requiredSections.length ? "default" : "destructive"}>
              {selectedRequiredCount}/{requiredSections.length} required sections
            </Badge>
          </div>
        </div>
      </Card>

      {/* Section selector */}
      <SectionTypeSelector
        sections={suggestedSections}
        selectedSections={selectedSections}
        onChange={onSelectedSectionsChange}
      />

      {/* Validation messages */}
      <div className="space-y-2">
        {selectedRequiredCount < requiredSections.length && (
          <div className="text-sm text-destructive bg-red-50 p-3 rounded-lg border border-red-200">
            ⚠️ Please select all required sections to continue.
          </div>
        )}

        {selectedSections.length === 0 && (
          <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg border border-gray-200">
            💡 Select at least one section to proceed with your PRD.
          </div>
        )}

        {totalSelectedWords > 2000 && (
          <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
            📝 Your selected sections will generate approximately {totalSelectedWords} words. 
            This is longer than typical PRDs. Consider removing some optional sections.
          </div>
        )}

        {selectedSections.length > 0 && selectedRequiredCount === requiredSections.length && (
          <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
            ✅ Great! Your structure looks good. You can proceed to customize section content.
          </div>
        )}
      </div>

      {/* Section breakdown */}
      {selectedSections.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Selected Sections Overview</h3>
          <div className="space-y-2">
            {selectedSections.map((sectionId, index) => {
              const section = suggestedSections.find(s => s.id === sectionId);
              if (!section) return null;

              return (
                <div
                  key={sectionId}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {index + 1}.
                    </span>
                    <span className="text-sm font-medium">
                      {section.title}
                    </span>
                    {section.required && (
                      <Badge variant="default" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ~{section.estimatedWords} words
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}