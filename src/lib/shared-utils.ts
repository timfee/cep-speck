/**
 * Shared utility functions to reduce duplication across the codebase
 */

/**
 * Common validation patterns
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0;
}

export function hasContent(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Common array utilities
 */
export function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    if (!(key in groups)) {
      groups[key] = [];
    }
    groups[key].push(item);
  }
  return groups;
}

/**
 * Common string utilities
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Common error handling patterns
 */
export function createError(
  message: string,
  code: string,
  details?: unknown
): Error & { code: string; details?: unknown } {
  const error = new Error(message) as Error & {
    code: string;
    details?: unknown;
  };
  error.code = code;
  error.details = details;
  return error;
}

export function isErrorWithCode(
  error: unknown,
  code: string
): error is Error & { code: string } {
  return (
    error instanceof Error &&
    "code" in error &&
    typeof error.code === "string" &&
    error.code === code
  );
}