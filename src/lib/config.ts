import packData from "./spec/prd-v1.json";
import type { SpecPack } from "./spec/types";

/**
 * The primary generative model for content creation and policy checks.
 * Centralized to allow easy swapping (e.g., to "gemini-1.5-pro").
 */
export const AI_MODEL_PRIMARY = "gemini-1.5-pro"; // Use a valid, available model

/**
 * The fallback model for resilience.
 */
export const AI_MODEL_FALLBACK = "gemini-1.5-flash";

/**
 * Default SpecPack for the application.
 * We import the JSON and cast it here, in one place.
 * ESLint restriction disabled as this is the centralized configuration pattern.
 */
export const DEFAULT_SPEC_PACK: SpecPack = packData as SpecPack;
