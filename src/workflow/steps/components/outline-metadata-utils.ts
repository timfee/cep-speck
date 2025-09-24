/**
 * Utility functions for outline metadata processing
 */

import type { OutlineMetadataListSelection } from "@/types/workflow";

export const parseCustomListInput = (value: string): string[] =>
  value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

export const deriveCustomTextareaValue = (
  selection: OutlineMetadataListSelection
) => selection.customValues.join("\n");

export const hasOptionalContent = (
  value: string | undefined
): value is string => typeof value === "string" && value.trim().length > 0;
