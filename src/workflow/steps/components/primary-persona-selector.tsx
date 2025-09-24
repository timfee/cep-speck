import React from "react";

import { LabeledField } from "@/lib/workflow/outline-form-shared";

import type {
  OutlineMetadata,
  OutlineMetadataPersonaSelection,
} from "@/types/workflow";

import { PersonaRadioGroup } from "./persona-radio-group";

interface PrimaryPersonaSelectorProps {
  metadata: OutlineMetadata;
  onChange: (updates: Partial<OutlineMetadata>) => void;
}

export function PrimaryPersonaSelector({
  metadata,
  onChange,
}: PrimaryPersonaSelectorProps) {
  const handlePrimaryPersonaChange = React.useCallback(
    (selection: Partial<OutlineMetadataPersonaSelection>) => {
      onChange({
        primaryPersona: {
          ...metadata.primaryPersona,
          ...selection,
        },
      });
    },
    [metadata.primaryPersona, onChange]
  );

  return (
    <LabeledField
      id="metadata-primary-persona"
      label="Primary Persona"
      hint="The key role or audience this project targets"
    >
      <PersonaRadioGroup
        primaryPersona={metadata.primaryPersona}
        onPersonaChange={handlePrimaryPersonaChange}
      />
    </LabeledField>
  );
}
