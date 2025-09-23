import { OUTLINE_METADATA_OPTION_LOOKUP } from "@/lib/constants/outline-enumerations";

import type {
  SerializedListSelection,
  SerializedOutlineMetadata,
  SerializedPresetSelection,
  SerializedPrimaryPersonaSelection,
  SerializedWorkflowOutline,
  StructuredWorkflowState,
} from "@/types/workflow";

export function serializeWorkflowToOutlinePayload(
  state: StructuredWorkflowState
): SerializedWorkflowOutline {
  return {
    initialPrompt: state.initialPrompt,
    enterprise: state.enterpriseParameters,
    metadata: buildSerializedOutlineMetadata(state.contentOutline.metadata),
    functionalRequirements: state.contentOutline.functionalRequirements,
    successMetrics: state.contentOutline.successMetrics,
    milestones: state.contentOutline.milestones,
    customerJourneys: state.contentOutline.customerJourneys,
    metricSchemas: state.contentOutline.metricSchemas,
  };
}

function buildSerializedOutlineMetadata(
  metadata: StructuredWorkflowState["contentOutline"]["metadata"]
): SerializedOutlineMetadata {
  return {
    projectName: metadata.projectName,
    projectTagline: metadata.projectTagline,
    problemStatement: metadata.problemStatement,
    notes: metadata.notes,
    primaryPersona: buildSerializedPrimaryPersona(metadata.primaryPersona),
    secondaryPersonas: buildSerializedListSelection(metadata.secondaryPersonas),
    valuePropositions: buildSerializedListSelection(metadata.valuePropositions),
    targetUsers: buildSerializedListSelection(metadata.targetUsers),
    platforms: buildSerializedListSelection(metadata.platforms),
    regions: buildSerializedListSelection(metadata.regions),
    strategicRisks: buildSerializedListSelection(metadata.strategicRisks),
  };
}

function buildSerializedPrimaryPersona(
  selection: StructuredWorkflowState["contentOutline"]["metadata"]["primaryPersona"]
): SerializedPrimaryPersonaSelection {
  const presetId = selection.presetId?.trim();
  const preset =
    typeof presetId === "string" && presetId.length > 0
      ? mapPreset(presetId)
      : undefined;

  const customValue = selection.customValue.trim();

  const result: SerializedPrimaryPersonaSelection = {};
  if (preset !== undefined) {
    result.preset = preset;
  }
  if (customValue.length > 0) {
    result.customValue = customValue;
  }

  return result;
}

function buildSerializedListSelection(
  selection: StructuredWorkflowState["contentOutline"]["metadata"]["secondaryPersonas"]
): SerializedListSelection {
  const presets: SerializedPresetSelection[] = [];

  for (const presetId of selection.presetIds) {
    const preset = mapPreset(presetId);
    if (preset !== undefined) {
      presets.push(preset);
    }
  }

  const custom: string[] = [];
  for (const value of selection.customValues) {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      custom.push(trimmed);
    }
  }

  return { presets, custom };
}

function mapPreset(
  id: string | undefined
): SerializedPresetSelection | undefined {
  if (typeof id !== "string") {
    return undefined;
  }

  const trimmed = id.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  if (
    !Object.prototype.hasOwnProperty.call(
      OUTLINE_METADATA_OPTION_LOOKUP,
      trimmed
    )
  ) {
    return {
      id: trimmed,
      label: trimmed,
    };
  }

  const option = OUTLINE_METADATA_OPTION_LOOKUP[trimmed];

  const preset: SerializedPresetSelection = {
    id: option.id,
    label: option.label,
  };

  if (
    typeof option.description === "string" &&
    option.description.trim().length > 0
  ) {
    preset.description = option.description.trim();
  }

  return preset;
}
