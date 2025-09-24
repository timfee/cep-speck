import React from "react";

import { METADATA_LIST_FIELDS } from "@/lib/spec/helpers/outline-enumerations";
import type { OutlineMetadata } from "@/types/workflow";

import { MetadataListFieldItem } from "./metadata-list-field-item";

interface MetadataListFieldsProps {
  metadata: OutlineMetadata;
  onChange: (updates: Partial<OutlineMetadata>) => void;
}

export function MetadataListFields({
  metadata,
  onChange,
}: MetadataListFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {METADATA_LIST_FIELDS.map(({ key, label, hint, options }) => (
        <MetadataListFieldItem
          key={key}
          fieldKey={key}
          label={label}
          hint={hint}
          options={options}
          metadata={metadata}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
