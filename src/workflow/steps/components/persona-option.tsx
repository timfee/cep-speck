import React from "react";

import { RadioGroupItem } from "@/components/ui/radio-group";

import { hasOptionalContent } from "./outline-metadata-utils";

interface PersonaOptionProps {
  persona: {
    id: string;
    label: string;
    description?: string;
  };
}

export function PersonaOption({ persona }: PersonaOptionProps) {
  return (
    <div className="flex items-start gap-2">
      <RadioGroupItem
        value={persona.id}
        id={`persona-${persona.id}`}
        className="mt-1"
      />
      <div className="flex-1">
        <label
          htmlFor={`persona-${persona.id}`}
          className="block cursor-pointer text-sm font-medium"
        >
          {persona.label}
        </label>
        {hasOptionalContent(persona.description) ? (
          <p className="text-xs text-muted-foreground">{persona.description}</p>
        ) : null}
      </div>
    </div>
  );
}
