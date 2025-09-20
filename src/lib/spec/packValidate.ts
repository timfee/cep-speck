import type { SpecPack } from "./types";

import {
  validateBannedTextRegex,
  validateHeaderRegex,
  validateItems,
} from "./validation/packHelpers";

export interface PackValidationError {
  code: string;
  message: string;
  evidence?: string;
}

export function validateSpecPack(pack: SpecPack): PackValidationError[] {
  const errs: PackValidationError[] = [];

  // Validate item definitions
  errs.push(...validateItems(pack));

  // Validate banned text regex patterns
  errs.push(...validateBannedTextRegex(pack));

  // Validate header regex pattern
  errs.push(...validateHeaderRegex(pack));

  return errs;
}

export function assertValidSpecPack(pack: SpecPack): void {
  const errs = validateSpecPack(pack);
  if (errs.length) {
    const detail = formatValidationErrors(errs);
    throw new Error("SpecPack validation failed:\n" + detail);
  }
}

/**
 * Formats validation errors into a readable string
 */
function formatValidationErrors(errs: PackValidationError[]): string {
  return errs
    .map(
      (e) =>
        `${e.code}: ${e.message}${e.evidence !== "" ? " -> " + e.evidence : ""}`
    )
    .join("\n");
}
