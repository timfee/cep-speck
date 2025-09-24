import React from "react";

import { Card } from "@/components/ui/card";
import { formSectionClass } from "@/lib/workflow/outline-form-shared";
import type { OutlineMetadata } from "@/types/workflow";

import { MetadataListFields } from "./metadata-list-fields";
import { PrimaryPersonaSelector } from "./primary-persona-selector";
import { ProjectMetadataFields } from "./project-metadata-fields";

interface OutlineMetadataPanelProps {
  metadata: OutlineMetadata;
  onChange: (updates: Partial<OutlineMetadata>) => void;
}

export function OutlineMetadataPanel({
  metadata,
  onChange,
}: OutlineMetadataPanelProps) {
  return (
    <Card className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Outline Metadata</h2>
        <p className="text-sm text-muted-foreground">
          Capture the structured project details that seed the drafter and
          outline prompts.
        </p>
      </div>
      <div className={formSectionClass}>
        <div className="grid gap-4 md:grid-cols-2">
          <ProjectMetadataFields metadata={metadata} onChange={onChange} />
        </div>
        <PrimaryPersonaSelector metadata={metadata} onChange={onChange} />
        <MetadataListFields metadata={metadata} onChange={onChange} />
      </div>
    </Card>
  );
}
