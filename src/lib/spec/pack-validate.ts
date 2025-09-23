import { getItem } from "./registry";
import type { SpecPack } from "./types";

export interface PackValidationError {
  code: string;
  message: string;
  evidence?: string;
}

/**
 * Validates item definitions in the spec pack
 */
function validateItems(pack: SpecPack): PackValidationError[] {
  const errs: PackValidationError[] = [];
  const seen = new Set<string>();

  for (const def of pack.items) {
    // Check for duplicate IDs
    if (seen.has(def.id)) {
      errs.push({
        code: "DUPLICATE_ID",
        message: `Duplicate item id: ${def.id}`,
      });
    } else {
      seen.add(def.id);
    }

    // Validate priority
    if (typeof def.priority !== "number" || Number.isNaN(def.priority)) {
      errs.push({
        code: "BAD_PRIORITY",
        message: `Priority must be numeric: ${def.id}`,
        evidence: String(def.priority),
      });
    }

    // Check item registration
    try {
      getItem(def.id);
    } catch (registrationError) {
      console.warn("Item registration check failed:", def.id, {
        error:
          registrationError instanceof Error
            ? registrationError.message
            : String(registrationError),
      });
      errs.push({
        code: "UNREGISTERED",
        message: `Item not registered: ${def.id}`,
      });
    }
  }

  return errs;
}

/**
 * Validates banned text regex patterns
 */
function validateBannedTextRegex(pack: SpecPack): PackValidationError[] {
  const errs: PackValidationError[] = [];
  const regexList = pack.globals?.bannedText?.regex ?? [];

  for (const r of regexList) {
    try {
      // Handle (?i) syntax like the bannedText validator does
      const hasInlineI = /^\(\?i\)/.test(r);
      const source = r.replace(/^\(\?i\)/, "");
      new RegExp(source, hasInlineI ? "gi" : "g");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errs.push({
        code: "BAD_REGEX",
        message: `Invalid bannedText regex: ${r}`,
        evidence: errorMessage,
      });
    }
  }

  return errs;
}

/**
 * Validates header regex pattern
 */
function validateHeaderRegex(pack: SpecPack): PackValidationError[] {
  const errs: PackValidationError[] = [];
  const headerRegex = pack.composition?.headerRegex ?? "";

  if (headerRegex.length > 0) {
    try {
      new RegExp(headerRegex);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errs.push({
        code: "BAD_HEADER_REGEX",
        message: "Invalid headerRegex",
        evidence: errorMessage,
      });
    }
  }

  return errs;
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
