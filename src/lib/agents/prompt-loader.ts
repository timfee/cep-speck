/**
 * Utility for loading prompt files from the guides directory
 */

import { readFile } from "fs/promises";
import { join } from "path";

import type { PromptConfig } from "./types";

/**
 * Cache for loaded prompt files to avoid repeated file system access
 */
const promptCache = new Map<string, string>();

/**
 * Load a prompt file from the guides directory
 *
 * @param config - Configuration for prompt loading
 * @returns Promise resolving to the prompt content
 *
 * @example
 * ```typescript
 * const masterPrompt = await loadPrompt({
 *   path: "guides/prompts/drafter-master.md",
 *   cache: true,
 *   fallback: "Default prompt content"
 * });
 * ```
 */
export async function loadPrompt(config: PromptConfig): Promise<string> {
  const { path, cache = true, fallback = "" } = config;

  // Check cache first if caching is enabled
  if (cache && promptCache.has(path)) {
    const cached = promptCache.get(path);
    if (cached !== undefined) {
      return cached;
    }
  }

  try {
    // Resolve path relative to project root
    const fullPath = join(process.cwd(), path);
    const content = await readFile(fullPath, "utf-8");

    // Cache the result if caching is enabled
    if (cache) {
      promptCache.set(path, content);
    }

    return content;
  } catch (error) {
    console.warn(`Failed to load prompt from ${path}:`, error);

    // Return fallback content if provided
    if (fallback) {
      return fallback;
    }

    // Re-throw error if no fallback
    throw new Error(
      `Failed to load prompt from ${path}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Load a prompt file with a default fallback
 *
 * @param path - Path to the prompt file
 * @param fallback - Default content if file cannot be loaded
 * @returns Promise resolving to the prompt content
 */
export async function loadPromptWithFallback(
  path: string,
  fallback: string
): Promise<string> {
  return loadPrompt({ path, cache: true, fallback });
}

/**
 * Clear the prompt cache (useful for testing or development)
 */
export function clearPromptCache(): void {
  promptCache.clear();
}

/**
 * Get current cache size (useful for monitoring)
 */
export function getPromptCacheSize(): number {
  return promptCache.size;
}
