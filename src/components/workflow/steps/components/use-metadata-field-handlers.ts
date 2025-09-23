import React from "react";

import type { OutlineMetadata } from "@/types/workflow";

import { parseCustomListInput } from "./outline-metadata-utils";

// Type for metadata list keys to ensure type safety
type MetadataListKey = keyof Pick<
  OutlineMetadata,
  | "secondaryPersonas"
  | "valuePropositions"
  | "targetUsers"
  | "platforms"
  | "regions"
  | "strategicRisks"
>;

export function useMetadataFieldHandlers(
  fieldKey: string,
  metadata: OutlineMetadata,
  onChange: (updates: Partial<OutlineMetadata>) => void
) {
  const typedKey = fieldKey as MetadataListKey;
  const fieldData = metadata[typedKey];

  const handleCustomListChange = React.useCallback(
    (value: string) => {
      onChange({
        [typedKey]: {
          ...fieldData,
          customValues: parseCustomListInput(value),
        },
      } as Partial<OutlineMetadata>);
    },
    [fieldData, onChange, typedKey]
  );

  const togglePresetSelection = React.useCallback(
    (optionId: string, checked: boolean) => {
      const nextPresetIds = checked
        ? Array.from(new Set([...fieldData.presetIds, optionId]))
        : fieldData.presetIds.filter((id) => id !== optionId);

      onChange({
        [typedKey]: {
          ...fieldData,
          presetIds: nextPresetIds,
        },
      } as Partial<OutlineMetadata>);
    },
    [fieldData, onChange, typedKey]
  );

  return {
    fieldData,
    handleCustomListChange,
    togglePresetSelection,
  };
}
