/**
 * The primary generative model for content creation and policy checks.
 * Centralized to allow easy swapping (e.g., to "gemini-1.5-pro").
 */
export const AI_MODEL_PRIMARY = "gemini-1.5-pro"; // Use a valid, available model

/**
 * The fallback model for resilience.
 */
export const AI_MODEL_FALLBACK = "gemini-1.5-flash";
