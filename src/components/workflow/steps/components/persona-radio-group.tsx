import React from "react";

import { RadioGroup } from "@/components/ui/radio-group";
import { PRIMARY_PERSONA_OPTIONS } from "@/lib/spec/helpers/outline-enumerations";
import type { OutlineMetadataPersonaSelection } from "@/types/workflow";

import { CustomPersonaInput } from "./custom-persona-input";
import { PersonaOption } from "./persona-option";

interface PersonaRadioGroupProps {
  primaryPersona: OutlineMetadataPersonaSelection;
  onPersonaChange: (
    selection: Partial<OutlineMetadataPersonaSelection>
  ) => void;
}

export function PersonaRadioGroup({
  primaryPersona,
  onPersonaChange,
}: PersonaRadioGroupProps) {
  const personaRadioValue =
    primaryPersona.presetId ??
    (primaryPersona.customValue.length > 0 ? "custom" : "");

  return (
    <RadioGroup
      value={personaRadioValue}
      onValueChange={(value) => {
        if (value === "custom") {
          onPersonaChange({
            presetId: "",
            useCustom: true,
          });
        } else {
          onPersonaChange({
            presetId: value,
            useCustom: false,
            customValue: "",
          });
        }
      }}
    >
      {PRIMARY_PERSONA_OPTIONS.map((persona) => (
        <PersonaOption key={persona.id} persona={persona} />
      ))}
      <CustomPersonaInput
        primaryPersona={primaryPersona}
        onPersonaChange={onPersonaChange}
      />
    </RadioGroup>
  );
}
