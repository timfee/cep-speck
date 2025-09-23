/**
 * Outline enumeration options and utilities
 * Consolidated from lib/constants/outline-enumerations*
 */

import {
  type OutlineOption,
  PRIMARY_PERSONA_OPTIONS,
  SECONDARY_PERSONA_OPTIONS,
  VALUE_PROPOSITION_OPTIONS,
  TARGET_USER_OPTIONS,
  PLATFORM_OPTIONS,
  REGION_OPTIONS,
  STRATEGIC_RISK_OPTIONS,
  METADATA_LIST_FIELDS,
  type MetadataFieldConfig,
} from "./outline-data";

export {
  type OutlineOption,
  PRIMARY_PERSONA_OPTIONS,
  SECONDARY_PERSONA_OPTIONS,
  VALUE_PROPOSITION_OPTIONS,
  TARGET_USER_OPTIONS,
  PLATFORM_OPTIONS,
  REGION_OPTIONS,
  STRATEGIC_RISK_OPTIONS,
  METADATA_LIST_FIELDS,
  type MetadataFieldConfig,
};

export const OUTLINE_METADATA_OPTION_LOOKUP: Record<string, OutlineOption> =
  (() => {
    const lookup: Record<string, OutlineOption> = {};
    const allOptionGroups: OutlineOption[][] = [
      PRIMARY_PERSONA_OPTIONS,
      SECONDARY_PERSONA_OPTIONS,
      VALUE_PROPOSITION_OPTIONS,
      TARGET_USER_OPTIONS,
      PLATFORM_OPTIONS,
      REGION_OPTIONS,
      STRATEGIC_RISK_OPTIONS,
    ];

    for (const group of allOptionGroups) {
      for (const option of group) {
        lookup[option.id] = option;
      }
    }

    return lookup;
  })();

interface EnumerationGroup {
  title: string;
  options: OutlineOption[];
}

const ENUMERATION_GROUPS: EnumerationGroup[] = [
  { title: "Primary personas", options: PRIMARY_PERSONA_OPTIONS },
  { title: "Secondary personas", options: SECONDARY_PERSONA_OPTIONS },
  { title: "Value propositions", options: VALUE_PROPOSITION_OPTIONS },
  { title: "Target users", options: TARGET_USER_OPTIONS },
  { title: "Platforms", options: PLATFORM_OPTIONS },
  { title: "Regions", options: REGION_OPTIONS },
  { title: "Strategic risks", options: STRATEGIC_RISK_OPTIONS },
];

export function formatOutlineEnumerationsForPrompt(): string {
  return ENUMERATION_GROUPS.map(({ title, options }) => {
    const list = options
      .map((option) => {
        const description =
          typeof option.description === "string" &&
          option.description.length > 0
            ? `: ${option.description}`
            : "";
        return `- ${option.label}${description}`;
      })
      .join("\n");
    return `### ${title}\n${list}`;
  }).join("\n\n");
}
