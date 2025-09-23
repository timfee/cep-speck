/**
 * Enhanced workflow serialization that maintains data fidelity
 * Addresses BLOCKER 2: Data Format Mismatch
 */

import type {
  FunctionalRequirement,
  Milestone,
  StructuredWorkflowState,
  SuccessMetric,
} from "@/types/workflow";

const PROJECT_NAME_WORD_LIMIT = 5;
const PROJECT_NAME_MAX_LENGTH = 50;
const PROJECT_NAME_TRUNCATE_LENGTH = 47;
const MIN_SPEC_TEXT_LENGTH = 200;
const METRIC_SUMMARY_LIMIT = 3;
const SUMMARY_SEPARATOR = " - ";

/**
 * Serialize structured workflow state to spec text format
 * Maintains data integrity while transforming to expected API format
 */
export function serializeWorkflowToSpec(
  state: StructuredWorkflowState
): string {
  const normalizedContent = buildNormalizedSectionMap(state.sectionContents);
  const output: string[] = [];

  // Project metadata block
  const { enterpriseParameters } = state;
  output.push(`Project: ${extractProjectName(state.initialPrompt)}`);
  output.push(`Target SKU: ${formatTerm(enterpriseParameters.targetSku)}`);
  output.push(
    `Deployment Model: ${formatTerm(enterpriseParameters.deploymentModel)}`
  );
  output.push(
    `Support Level: ${formatTerm(enterpriseParameters.supportLevel)}`
  );
  output.push(
    `Rollout Strategy: ${formatTerm(enterpriseParameters.rolloutStrategy)}`
  );
  output.push(
    `Security Requirements: ${formatList(
      enterpriseParameters.securityRequirements.map(formatTerm),
      "None documented"
    )}`
  );
  output.push(
    `Integrations: ${formatList(
      enterpriseParameters.integrations.map(formatTerm),
      "None documented"
    )}`
  );
  output.push("");

  const sections: { title: string; content: string }[] = [
    { title: "TL;DR", content: buildTldrSection(state, normalizedContent) },
    {
      title: "People Problems",
      content: buildPeopleProblemsSection(state, normalizedContent),
    },
    {
      title: "Key Personas",
      content: buildKeyPersonasSection(state, normalizedContent),
    },
    { title: "Goals", content: buildGoalsSection(state, normalizedContent) },
    { title: "CUJs", content: buildCujsSection(state, normalizedContent) },
    {
      title: "Functional Requirements",
      content: buildFunctionalRequirementsSection(state, normalizedContent),
    },
    {
      title: "Technical Considerations",
      content: buildTechnicalConsiderationsSection(state, normalizedContent),
    },
    {
      title: "Success Metrics",
      content: buildSuccessMetricsSection(state, normalizedContent),
    },
    {
      title: "Go-to-Market",
      content: buildGoToMarketSection(state, normalizedContent),
    },
  ];

  for (const [index, section] of sections.entries()) {
    output.push(`# ${index + 1}. ${section.title}`);
    const trimmedContent = section.content.trim();
    output.push(
      trimmedContent.length > 0
        ? trimmedContent
        : placeholder(`Add content for ${section.title}`)
    );
    output.push("");
  }

  return output.join("\n").trim();
}

/**
 * Extract project name from initial prompt
 */
function extractProjectName(prompt: string): string {
  // Try to extract a project name from the prompt
  const lines = prompt.split("\n");
  const projectLine = lines.find((l) => l.toLowerCase().includes("project"));
  if (projectLine !== undefined) {
    return projectLine.replace(/project[:\s]*/i, "").trim();
  }

  // Generate a name from first few words
  const words = prompt.split(/\s+/).slice(0, PROJECT_NAME_WORD_LIMIT).join(" ");
  return words.length > PROJECT_NAME_MAX_LENGTH
    ? `${words.substring(0, PROJECT_NAME_TRUNCATE_LENGTH)}...`
    : words;
}

/**
 * Validate that the serialized spec contains required information
 */
export function validateSerializedSpec(specText: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  const requiredHeaders = [
    "# 1. TL;DR",
    "# 2. People Problems",
    "# 3. Key Personas",
    "# 4. Goals",
    "# 5. CUJs",
    "# 6. Functional Requirements",
    "# 7. Technical Considerations",
    "# 8. Success Metrics",
    "# 9. Go-to-Market",
  ];

  if (!specText.includes("Project:")) {
    issues.push("Missing project metadata");
  }

  if (!specText.includes("Target SKU:")) {
    issues.push("Missing target SKU");
  }

  for (const header of requiredHeaders) {
    if (!specText.includes(header)) {
      issues.push(`Missing section: ${header}`);
    }
  }

  if (specText.length < MIN_SPEC_TEXT_LENGTH) {
    issues.push("Spec text is too short");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

type SectionContentMap = Record<string, string>;

function buildNormalizedSectionMap(
  contents: Record<string, string>
): SectionContentMap {
  const map: SectionContentMap = {};
  for (const [key, value] of Object.entries(contents)) {
    const normalized = normalizeKey(key);
    if (normalized.length > 0 && value.trim().length > 0) {
      map[normalized] = value.trim();
    }
  }
  return map;
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function pickOverride(map: SectionContentMap, keys: string[]): string | null {
  for (const key of keys) {
    const normalized = normalizeKey(key);
    if (normalized in map) {
      return map[normalized];
    }
  }
  return null;
}

function placeholder(instruction: string): string {
  return `[PM_INPUT_NEEDED: ${instruction}]`;
}

function buildTldrSection(
  state: StructuredWorkflowState,
  contentOverrides: SectionContentMap
): string {
  const override = pickOverride(contentOverrides, [
    "tldr",
    "tl;dr",
    "executivesummary",
  ]);
  if (override !== null) return override;

  const lines: string[] = [];
  const summary = state.contentOutline.executiveSummary;

  if (summary !== undefined) {
    lines.push(`- Problem Statement: ${summary.problemStatement}`);
    lines.push(`- Proposed Solution: ${summary.proposedSolution}`);
    lines.push(`- Business Value: ${summary.businessValue}`);
  } else if (state.initialPrompt.trim().length > 0) {
    lines.push(state.initialPrompt.trim());
  }

  const targetUsers = summary?.targetUsers;
  if (typeof targetUsers === "string" && targetUsers.trim().length > 0) {
    lines.push(`- Target Users: ${targetUsers}`);
  }

  const metricsSummary = summarizeMetrics(state.contentOutline.successMetrics);
  if (metricsSummary.length > 0) {
    lines.push("");
    lines.push("Key Metrics:");
    for (const metricLine of metricsSummary) {
      lines.push(`- ${metricLine}`);
    }
  }

  if (state.contentOutline.milestones.length > 0) {
    const milestoneDetail = formatMilestone(state.contentOutline.milestones[0]);
    lines.push("");
    lines.push(`Near-term Milestone: ${milestoneDetail}`);
  }

  if (lines.length === 0) {
    return placeholder(
      "Summarize the opportunity, proposed solution, critical metrics, and near-term milestone for executive readers"
    );
  }

  return lines.join("\n").trim();
}

function buildPeopleProblemsSection(
  state: StructuredWorkflowState,
  contentOverrides: SectionContentMap
): string {
  const override = pickOverride(contentOverrides, [
    "peopleproblems",
    "problems",
    "painpoints",
  ]);
  if (override !== null) return override;

  const derived = state.contentOutline.functionalRequirements
    .filter((req) => req.description.trim().length > 0)
    .map((req) => `- ${req.title}: ${req.description}`);

  if (derived.length > 0) {
    return [
      "Observed operational gaps tied to user feedback and telemetry:",
      ...derived,
    ].join("\n");
  }

  return placeholder(
    "Document top 3 user or admin problems with supporting telemetry, qualitative research, and quantified impact"
  );
}

function buildKeyPersonasSection(
  state: StructuredWorkflowState,
  contentOverrides: SectionContentMap
): string {
  const override = pickOverride(contentOverrides, ["keypersonas", "personas"]);
  if (override !== null) return override;

  const summary = state.contentOutline.executiveSummary;
  const personaSource = summary?.targetUsers;
  if (typeof personaSource === "string" && personaSource.trim().length > 0) {
    const personas = personaSource
      .split(/[,;\n]/)
      .map((persona) => persona.trim())
      .filter(Boolean)
      .map((persona) => `- ${persona}`);

    if (personas.length > 0) {
      return [
        "Primary admin and security personas impacted:",
        ...personas,
      ].join("\n");
    }
  }

  return placeholder(
    "Identify primary personas (role, environment, device posture) and note differentiating needs for Chrome Enterprise Premium"
  );
}

function buildGoalsSection(
  state: StructuredWorkflowState,
  contentOverrides: SectionContentMap
): string {
  const override = pickOverride(contentOverrides, [
    "goals",
    "objectives",
    "outcomes",
  ]);
  if (override !== null) return override;

  const metrics = state.contentOutline.successMetrics;
  if (metrics.length > 0) {
    return metrics
      .map((metric) => `- ${metric.name}: ${metric.description}`)
      .join("\n");
  }

  return placeholder(
    "Define measurable business goals mapped to the quantified problems and success metrics"
  );
}

function buildCujsSection(
  state: StructuredWorkflowState,
  contentOverrides: SectionContentMap
): string {
  const override = pickOverride(contentOverrides, ["cujs", "customerjourneys"]);
  if (override !== null) return override;

  const cujLines = state.contentOutline.functionalRequirements
    .filter((req) => (req.userStory ?? "").trim().length > 0)
    .map((req) => `- ${req.userStory} (enables: ${req.title})`);

  if (cujLines.length > 0) {
    return [
      "Critical user journeys traced to problems and features:",
      ...cujLines,
    ].join("\n");
  }

  return placeholder(
    "Outline critical user journeys with trigger, key steps, systems touched, and success criteria"
  );
}

function buildFunctionalRequirementsSection(
  state: StructuredWorkflowState,
  contentOverrides: SectionContentMap
): string {
  const override = pickOverride(contentOverrides, [
    "functionalrequirements",
    "featurerequirements",
  ]);
  if (override !== null) return override;

  const { functionalRequirements } = state.contentOutline;
  if (functionalRequirements.length === 0) {
    return placeholder(
      "Detail prioritized functional requirements with SKU callouts, acceptance criteria, dependencies, and instrumentation plan"
    );
  }

  const requirementBlocks = functionalRequirements.map((req) =>
    formatFunctionalRequirement(req)
  );
  return requirementBlocks.join("\n");
}

function buildTechnicalConsiderationsSection(
  state: StructuredWorkflowState,
  contentOverrides: SectionContentMap
): string {
  const override = pickOverride(contentOverrides, [
    "technicalconsiderations",
    "technicalarchitecture",
  ]);
  if (override !== null) return override;

  const lines: string[] = [];
  const { enterpriseParameters } = state;

  lines.push(
    `- Deployment Model: ${formatTerm(enterpriseParameters.deploymentModel)}`
  );
  lines.push(
    `- Security Requirements: ${formatList(
      enterpriseParameters.securityRequirements.map(formatTerm),
      "No specialized controls recorded"
    )}`
  );
  lines.push(
    `- Integrations: ${formatList(
      enterpriseParameters.integrations.map(formatTerm),
      "No upstream integrations identified"
    )}`
  );
  lines.push(
    `- Support Level: ${formatTerm(enterpriseParameters.supportLevel)}`
  );

  const dependencyLines = state.contentOutline.functionalRequirements
    .filter((req) => (req.dependencies ?? []).length > 0)
    .flatMap((req) =>
      (req.dependencies ?? []).map(
        (dep) => `  • ${req.title}: depends on ${formatTerm(dep)}`
      )
    );

  if (dependencyLines.length > 0) {
    lines.push("Dependencies:");
    lines.push(...dependencyLines);
  }

  return lines.join("\n").trim();
}

function buildSuccessMetricsSection(
  state: StructuredWorkflowState,
  contentOverrides: SectionContentMap
): string {
  const override = pickOverride(contentOverrides, [
    "successmetrics",
    "metrics",
  ]);
  if (override !== null) return override;

  const { successMetrics } = state.contentOutline;
  if (successMetrics.length === 0) {
    return placeholder(
      "Provide success metrics with baseline, target, timeframe, units, and system of record for verification"
    );
  }

  return successMetrics.map((metric) => formatSuccessMetric(metric)).join("\n");
}

function buildGoToMarketSection(
  state: StructuredWorkflowState,
  contentOverrides: SectionContentMap
): string {
  const override = pickOverride(contentOverrides, [
    "gotomarket",
    "launchplan",
    "gtm",
  ]);
  if (override !== null) return override;

  const lines: string[] = [];
  lines.push(
    `- Rollout Strategy: ${formatTerm(state.enterpriseParameters.rolloutStrategy)}`
  );

  if (state.contentOutline.milestones.length > 0) {
    lines.push("- Key Milestones:");
    for (const milestone of state.contentOutline.milestones) {
      lines.push(`  • ${formatMilestone(milestone)}`);
    }
  }

  if (lines.length <= 1) {
    return placeholder(
      "Detail go-to-market plan covering launch gating, comms, training, and feedback instrumentation"
    );
  }

  return lines.join("\n");
}

function summarizeMetrics(metrics: SuccessMetric[]): string[] {
  return metrics.slice(0, METRIC_SUMMARY_LIMIT).map((metric) => {
    const parts = [metric.name];
    if (typeof metric.target === "string" && metric.target.trim().length > 0) {
      parts.push(`Target: ${metric.target}`);
    }
    if (
      typeof metric.measurement === "string" &&
      metric.measurement.trim().length > 0
    ) {
      parts.push(`Measurement: ${metric.measurement}`);
    }
    return parts.join(SUMMARY_SEPARATOR);
  });
}

function formatFunctionalRequirement(req: FunctionalRequirement): string {
  const lines: string[] = [];
  lines.push(`- [${req.priority}] ${req.title}: ${req.description}`);
  if (typeof req.userStory === "string" && req.userStory.trim().length > 0) {
    lines.push(`  • User Story: ${req.userStory}`);
  }
  if (
    Array.isArray(req.acceptanceCriteria) &&
    req.acceptanceCriteria.length > 0
  ) {
    lines.push(`  • Acceptance Criteria: ${req.acceptanceCriteria.join("; ")}`);
  }
  if (Array.isArray(req.dependencies) && req.dependencies.length > 0) {
    lines.push(
      `  • Dependencies: ${req.dependencies.map(formatTerm).join(", ")}`
    );
  }
  if (
    typeof req.estimatedEffort === "string" &&
    req.estimatedEffort.trim().length > 0
  ) {
    lines.push(`  • Estimated Effort: ${req.estimatedEffort}`);
  }
  return lines.join("\n");
}

function formatSuccessMetric(metric: SuccessMetric): string {
  const segments: string[] = [];
  segments.push(`- ${metric.name}: ${metric.description}`);
  if (typeof metric.target === "string" && metric.target.trim().length > 0) {
    segments.push(`  • Target: ${metric.target}`);
  }
  if (
    typeof metric.measurement === "string" &&
    metric.measurement.trim().length > 0
  ) {
    segments.push(`  • Measurement: ${metric.measurement}`);
  }
  if (
    typeof metric.frequency === "string" &&
    metric.frequency.trim().length > 0
  ) {
    segments.push(`  • Reporting Cadence: ${metric.frequency}`);
  }
  if (typeof metric.owner === "string" && metric.owner.trim().length > 0) {
    segments.push(`  • Owner: ${metric.owner}`);
  }
  return segments.join("\n");
}

function formatMilestone(milestone: Milestone): string {
  const parts = [milestone.title];
  parts.push(`Phase: ${formatTerm(milestone.phase)}`);
  if (
    typeof milestone.estimatedDate === "string" &&
    milestone.estimatedDate.trim().length > 0
  ) {
    parts.push(`ETA: ${milestone.estimatedDate}`);
  }
  parts.push(milestone.description);
  return parts.join(SUMMARY_SEPARATOR);
}

function formatList(items: string[], emptyValue: string): string {
  if (items.length === 0) return emptyValue;
  return items.join(", ");
}

function formatTerm(term: string): string {
  return term
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
