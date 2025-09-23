import React from "react";

import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

import {
  type OutlineOption,
  PLATFORM_OPTIONS,
  PRIMARY_PERSONA_OPTIONS,
  REGION_OPTIONS,
  SECONDARY_PERSONA_OPTIONS,
  STRATEGIC_RISK_OPTIONS,
  TARGET_USER_OPTIONS,
  VALUE_PROPOSITION_OPTIONS,
} from "@/lib/constants/outline-enumerations";

import type {
  OutlineMetadata,
  OutlineMetadataListSelection,
  OutlineMetadataPersonaSelection,
} from "@/types/workflow";

import {
  LabeledField,
  baseInputClass,
  formSectionClass,
} from "../hooks/outline-form-shared";

type MetadataListKey =
  | "secondaryPersonas"
  | "valuePropositions"
  | "targetUsers"
  | "platforms"
  | "regions"
  | "strategicRisks";

interface OutlineMetadataPanelProps {
  metadata: OutlineMetadata;
  onChange: (updates: Partial<OutlineMetadata>) => void;
}

interface MetadataListFieldConfig {
  key: MetadataListKey;
  label: string;
  options: OutlineOption[];
  hint?: string;
}

const listFields: MetadataListFieldConfig[] = [
  {
    key: "secondaryPersonas",
    label: "Secondary Personas",
    hint: "Select supporting personas that influence delivery",
    options: SECONDARY_PERSONA_OPTIONS,
  },
  {
    key: "valuePropositions",
    label: "Value Propositions",
    hint: "Highlight the differentiating benefits for the drafter",
    options: VALUE_PROPOSITION_OPTIONS,
  },
  {
    key: "targetUsers",
    label: "Target Users",
    hint: "Role archetypes or segments expected to adopt the solution",
    options: TARGET_USER_OPTIONS,
  },
  {
    key: "platforms",
    label: "Supported Platforms",
    hint: "Browsers, operating systems, or key surfaces to prioritize",
    options: PLATFORM_OPTIONS,
  },
  {
    key: "regions",
    label: "Target Regions",
    hint: "Geographies in scope for the release or pilot",
    options: REGION_OPTIONS,
  },
  {
    key: "strategicRisks",
    label: "Strategic Risks",
    hint: "Critical risks the drafter should monitor",
    options: STRATEGIC_RISK_OPTIONS,
  },
];

const parseCustomListInput = (value: string): string[] =>
  value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const deriveCustomTextareaValue = (selection: OutlineMetadataListSelection) =>
  selection.customValues.join("\n");

const hasOptionalContent = (value: string | undefined): value is string =>
  typeof value === "string" && value.trim().length > 0;

const personaOptions = PRIMARY_PERSONA_OPTIONS;

export function OutlineMetadataPanel({
  metadata,
  onChange,
}: OutlineMetadataPanelProps) {
  const handleCustomListChange = React.useCallback(
    (field: MetadataListKey, value: string) => {
      onChange({
        [field]: {
          ...metadata[field],
          customValues: parseCustomListInput(value),
        },
      } as Partial<OutlineMetadata>);
    },
    [metadata, onChange]
  );

  const togglePresetSelection = React.useCallback(
    (field: MetadataListKey, optionId: string, checked: boolean) => {
      const fieldState = metadata[field];
      const nextPresetIds = checked
        ? Array.from(new Set([...fieldState.presetIds, optionId]))
        : fieldState.presetIds.filter((id) => id !== optionId);

      onChange({
        [field]: {
          ...fieldState,
          presetIds: nextPresetIds,
        },
      } as Partial<OutlineMetadata>);
    },
    [metadata, onChange]
  );

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

  const personaRadioValue =
    metadata.primaryPersona.presetId ??
    (metadata.primaryPersona.customValue.length > 0 ? "custom" : "");

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
          <LabeledField id="metadata-project-name" label="Project Name">
            <input
              id="metadata-project-name"
              className={baseInputClass}
              value={metadata.projectName}
              onChange={(event) =>
                onChange({ projectName: event.target.value.trimStart() })
              }
              placeholder="e.g., Zero Trust Browser Guard"
            />
          </LabeledField>
          <LabeledField id="metadata-project-tagline" label="Project Tagline">
            <input
              id="metadata-project-tagline"
              className={baseInputClass}
              value={metadata.projectTagline}
              onChange={(event) =>
                onChange({ projectTagline: event.target.value.trimStart() })
              }
              placeholder="Short description for prompts"
            />
          </LabeledField>
        </div>
        <LabeledField
          id="metadata-problem-statement"
          label="Problem Statement"
          hint="Summarize the customer problem or unmet need"
        >
          <Textarea
            id="metadata-problem-statement"
            value={metadata.problemStatement}
            onChange={(event) =>
              onChange({ problemStatement: event.target.value })
            }
            placeholder="Describe the pain point the product addresses"
          />
        </LabeledField>
        <div className="grid gap-4 md:grid-cols-2">
          <LabeledField
            id="metadata-primary-persona"
            label="Primary Persona"
            hint="Select the persona most responsible for the outcome"
          >
            <RadioGroup
              value={personaRadioValue}
              onValueChange={(value) => {
                if (value === "custom") {
                  handlePrimaryPersonaChange({
                    presetId: undefined,
                  });
                  return;
                }

                handlePrimaryPersonaChange({
                  presetId: value,
                  customValue: "",
                });
              }}
              className="gap-2"
            >
              {personaOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm shadow-sm transition-colors hover:bg-muted"
                >
                  <RadioGroupItem value={option.id} />
                  <span>
                    <span className="font-medium">{option.label}</span>
                    {hasOptionalContent(option.description) ? (
                      <span className="block text-muted-foreground">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                </label>
              ))}
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm shadow-sm transition-colors hover:bg-muted">
                <RadioGroupItem value="custom" />
                <span className="font-medium">Custom persona</span>
              </label>
            </RadioGroup>
            <input
              id="metadata-primary-persona-custom"
              className={baseInputClass}
              value={metadata.primaryPersona.customValue}
              onChange={(event) =>
                handlePrimaryPersonaChange({
                  presetId: undefined,
                  customValue: event.target.value,
                })
              }
              placeholder="e.g., Delegated policy reviewer"
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
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {listFields.map(({ key, label, hint, options }) => (
            <div key={key} className="flex flex-col gap-3">
              <fieldset className="rounded-md border border-border p-3">
                <legend className="px-1 text-sm font-medium">{label}</legend>
                {hasOptionalContent(hint) ? (
                  <p className="px-1 text-xs text-muted-foreground">{hint}</p>
                ) : null}
                <div className="mt-2 flex flex-col gap-2">
                  {options.map((option) => {
                    const checked = metadata[key].presetIds.includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className="flex cursor-pointer items-start gap-3 rounded border border-transparent p-2 text-sm transition-colors hover:border-border hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 size-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          checked={checked}
                          onChange={(event) =>
                            togglePresetSelection(
                              key,
                              option.id,
                              event.target.checked
                            )
                          }
                        />
                        <span>
                          <span className="font-medium">{option.label}</span>
                          {hasOptionalContent(option.description) ? (
                            <span className="block text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <LabeledField
                id={`metadata-${key}-custom`}
                label="Custom entries"
                hint="Add any values not covered by the presets"
              >
                <Textarea
                  id={`metadata-${key}-custom`}
                  value={deriveCustomTextareaValue(metadata[key])}
                  onChange={(event) =>
                    handleCustomListChange(key, event.target.value)
                  }
                  placeholder="Enter one value per line"
                />
              </LabeledField>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
