import React from "react";

import { Textarea } from "@/components/ui/textarea";
import { LabeledField, baseInputClass } from "@/lib/workflow/outline-form-shared";
import type { OutlineMetadata } from "@/types/workflow";


interface ProjectMetadataFieldsProps {
  metadata: OutlineMetadata;
  onChange: (updates: Partial<OutlineMetadata>) => void;
}

export function ProjectMetadataFields({
  metadata,
  onChange,
}: ProjectMetadataFieldsProps) {
  return (
    <>
      <LabeledField id="metadata-project-name" label="Project Name">
        <input
          id="metadata-project-name"
          className={baseInputClass}
          value={metadata.projectName}
          onChange={(event) => onChange({ projectName: event.target.value })}
          placeholder="Product or feature name"
        />
      </LabeledField>
      <LabeledField id="metadata-project-tagline" label="Project Tagline">
        <input
          id="metadata-project-tagline"
          className={baseInputClass}
          value={metadata.projectTagline}
          onChange={(event) => onChange({ projectTagline: event.target.value })}
          placeholder="Brief marketing tagline"
        />
      </LabeledField>
      <LabeledField
        id="metadata-problem-statement"
        label="Problem Statement"
        hint="Define the core problem this project addresses"
      >
        <Textarea
          id="metadata-problem-statement"
          value={metadata.problemStatement}
          onChange={(event) =>
            onChange({ problemStatement: event.target.value })
          }
          placeholder="What problem are we solving?"
        />
      </LabeledField>
      <LabeledField id="metadata-notes" label="Additional Notes">
        <Textarea
          id="metadata-notes"
          value={metadata.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="Context the drafter should keep in mind"
        />
      </LabeledField>
    </>
  );
}
