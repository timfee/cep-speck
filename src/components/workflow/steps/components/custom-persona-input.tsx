import React from "react";

import { RadioGroupItem } from "@/components/ui/radio-group";
import { baseInputClass } from "@/lib/workflow/outline-form-shared";
import type { OutlineMetadataPersonaSelection } from "@/types/workflow";


interface CustomPersonaInputProps {
  primaryPersona: OutlineMetadataPersonaSelection;
  onPersonaChange: (
    selection: Partial<OutlineMetadataPersonaSelection>
  ) => void;
}

export function CustomPersonaInput({
  primaryPersona,
  onPersonaChange,
}: CustomPersonaInputProps) {
  return (
    <div className="flex items-start gap-2">
      <RadioGroupItem value="custom" id="persona-custom" className="mt-1" />
      <div className="flex-1">
        <label
          htmlFor="persona-custom"
          className="block cursor-pointer text-sm font-medium"
        >
          Custom persona
        </label>
        {primaryPersona.useCustom === true ? (
          <input
            className={`mt-1 ${baseInputClass}`}
            value={primaryPersona.customValue}
            onChange={(event) =>
              onPersonaChange({
                customValue: event.target.value,
              })
            }
            placeholder="Enter custom persona"
          />
        ) : null}
      </div>
    </div>
  );
}
