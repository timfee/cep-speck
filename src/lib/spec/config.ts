/**
 * Default configuration values for validation modules
 *
 * This centralizes common configuration to reduce hardcoding across modules
 * and make the system more maintainable.
 */

export interface ValidationConfig {
  // Word and content limits
  wordLimits: {
    defaultBudget: number;
    placeholderMinWords: number;
  };

  // Section requirements
  sections: {
    minCount: number;
    maxCount: number;
    defaultHeaderPattern: string;
  };

  // Quality thresholds
  quality: {
    maxVagueQuantifiers: number;
    maxHedgingPhrases: number;
    maxNumbersWithoutUnits: number;
    maxOverExplanationInstances: number;
  };

  // Regex patterns for common validations
  patterns: {
    headerRegex: string;
    metricRegex: string;
    placeholderRegex: string;
  };

  // Banned content defaults
  bannedContent: {
    businessSpeak: string[];
    qualityTheaterMetrics: string[];
    overExplanationPatterns: string[];
  };
}

/**
 * Default validation configuration
 */
export const DEFAULT_CONFIG: ValidationConfig = {
  wordLimits: {
    defaultBudget: 1800,
    placeholderMinWords: 3,
  },

  sections: {
    minCount: 8,
    maxCount: 12,
    defaultHeaderPattern: "# {n}. {title}",
  },

  quality: {
    maxVagueQuantifiers: 3,
    maxHedgingPhrases: 5,
    maxNumbersWithoutUnits: 2,
    maxOverExplanationInstances: 2,
  },

  patterns: {
    headerRegex: "^#\\s+\\d+\\.",
    metricRegex: "\\b\\d+[%]?\\b",
    placeholderRegex: "\\[PM_INPUT_NEEDED:[^\\]]+\\]",
  },

  bannedContent: {
    businessSpeak: [
      "solidify our future",
      "strengthen our position",
      "position ourselves",
      "future-proof",
    ],
    qualityTheaterMetrics: [
      "NPS",
      "Net Promoter Score",
      "satisfaction score",
      "happiness index",
      "engagement score",
    ],
    overExplanationPatterns: [
      "as mentioned|as stated|as discussed|as noted",
      "it should be noted|it is important to note|it is worth noting",
      "in other words|to put it simply|simply put|to clarify|to elaborate",
      "this means that|what this means is|the implication is|this implies",
    ],
  },
};

/**
 * Get configuration value with fallback to default
 */
export function getConfigValue<K extends keyof ValidationConfig>(
  config: Partial<ValidationConfig> | undefined,
  key: K
): ValidationConfig[K] {
  return config?.[key] ?? DEFAULT_CONFIG[key];
}

/**
 * Merge user config with defaults
 */
export function mergeConfig(
  userConfig?: Partial<ValidationConfig>
): ValidationConfig {
  if (!userConfig) return DEFAULT_CONFIG;

  return {
    wordLimits: { ...DEFAULT_CONFIG.wordLimits, ...userConfig.wordLimits },
    sections: { ...DEFAULT_CONFIG.sections, ...userConfig.sections },
    quality: { ...DEFAULT_CONFIG.quality, ...userConfig.quality },
    patterns: { ...DEFAULT_CONFIG.patterns, ...userConfig.patterns },
    bannedContent: {
      ...DEFAULT_CONFIG.bannedContent,
      ...userConfig.bannedContent,
    },
  };
}
