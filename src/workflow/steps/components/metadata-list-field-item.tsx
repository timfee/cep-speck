import React from "react";

import { Textarea } from "@/components/ui/textarea";
import { LabeledField } from "@/lib/workflow/outline-form-shared";
import type { OutlineMetadata } from "@/types/workflow";

import {
  deriveCustomTextareaValue,
  hasOptionalContent,
} from "./outline-metadata-utils";

import { PresetCheckboxList } from "./preset-checkbox-list";
import { useMetadataFieldHandlers } from "./use-metadata-field-handlers";

interface MetadataListFieldItemProps {
  fieldKey: string;
  label: string;
  hint?: string;
  options: Array<{ id: string; label: string; description?: string }>;
  metadata: OutlineMetadata;
  onChange: (updates: Partial<OutlineMetadata>) => void;
}

export function MetadataListFieldItem({
  fieldKey,
  label,
  hint,
  options,
  metadata,
  onChange,
}: MetadataListFieldItemProps) {
  const { fieldData, handleCustomListChange, togglePresetSelection } =
    useMetadataFieldHandlers(fieldKey, metadata, onChange);

  return (
    <div className="flex flex-col gap-3">
      <fieldset className="rounded-md border border-border p-3">
        <legend className="px-1 text-sm font-medium">{label}</legend>
        {hasOptionalContent(hint) ? (
          <p className="px-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
        <PresetCheckboxList
          options={options}
          checkedIds={fieldData.presetIds}
          onToggle={togglePresetSelection}
        />
      </fieldset>
      <LabeledField
        id={`metadata-${fieldKey}-custom`}
        label="Custom entries"
        hint="Add any values not covered by the presets"
      >
        <Textarea
          id={`metadata-${fieldKey}-custom`}
          value={deriveCustomTextareaValue(fieldData)}
          onChange={(event) => handleCustomListChange(event.target.value)}
          placeholder="Enter one value per line"
        />
      </LabeledField>
    </div>
  );
}
