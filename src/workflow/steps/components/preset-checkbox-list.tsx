import React from "react";

import { hasOptionalContent } from "./outline-metadata-utils";

interface PresetCheckboxListProps {
  options: Array<{ id: string; label: string; description?: string }>;
  checkedIds: string[];
  onToggle: (optionId: string, checked: boolean) => void;
}

export function PresetCheckboxList({
  options,
  checkedIds,
  onToggle,
}: PresetCheckboxListProps) {
  return (
    <div className="mt-2 flex flex-col gap-2">
      {options.map((option) => {
        const checked = checkedIds.includes(option.id);
        return (
          <label
            key={option.id}
            className="flex cursor-pointer items-start gap-3 rounded border border-transparent p-2 text-sm transition-colors hover:border-border hover:bg-muted"
          >
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              checked={checked}
              onChange={(event) => onToggle(option.id, event.target.checked)}
            />
            <div className="flex-1">
              <span className="block font-medium">{option.label}</span>
              {hasOptionalContent(option.description) ? (
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              ) : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}
