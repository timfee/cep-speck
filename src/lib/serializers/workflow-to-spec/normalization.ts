import type { SectionContentMap } from "./types";

function normalizeWhitespace(value: string): string {
  return value.trim();
}

export function buildNormalizedSectionMap(
  contents: Record<string, string>
): SectionContentMap {
  const map: SectionContentMap = {};
  for (const [key, value] of Object.entries(contents)) {
    const normalizedKey = normalizeKey(key);
    const normalizedValue = normalizeWhitespace(value);
    if (normalizedKey.length > 0 && normalizedValue.length > 0) {
      map[normalizedKey] = normalizedValue;
    }
  }
  return map;
}

export function pickOverride(
  map: SectionContentMap,
  keys: readonly string[]
): string | null {
  for (const key of keys) {
    const normalized = normalizeKey(key);
    if (normalized in map) {
      return map[normalized];
    }
  }
  return null;
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}
