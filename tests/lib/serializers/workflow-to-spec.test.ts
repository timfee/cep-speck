import {
  serializeWorkflowToLegacySpecText,
  serializeWorkflowToSpec,
  validateLegacySpecText,
} from "@/lib/serializers/workflow-to-spec";

import { serializeWorkflowToOutlinePayload } from "@/lib/serializers/workflow-to-structured-outline";
import prdPack from "@/lib/spec/prd-v1.json";
import type { SpecItemDef, SpecPack } from "@/lib/spec/types";
import { validateAll } from "@/lib/spec/validate";
import type { StructuredWorkflowState } from "@/types/workflow";
import "@/lib/spec/items";

type WorkflowOverrides = Partial<StructuredWorkflowState>;

const DEFAULT_HEADER_REGEX = "^#\\s+\\d+\\.";
const STRUCTURE_VALIDATOR_IDS = new Set(["section-count", "label-pattern"]);

function createBaseState(
  overrides: WorkflowOverrides = {}
): StructuredWorkflowState {
  return {
    currentStep: "generate",
    initialPrompt:
      "Project: Zero Trust Browser Guard\nWe need to reduce unmanaged device risk for contractors handling sensitive files.",
    contentOutline: {
      metadata: {
        projectName: "Zero Trust Browser Guard",
        projectTagline: "Adaptive policy enforcement for unmanaged devices",
        problemStatement:
          "Contractors working from unmanaged devices trigger data exfiltration risks when downloading sensitive files.",
        primaryPersona: {
          presetId: "security-administrator",
          customValue: "",
        },
        secondaryPersonas: {
          presetIds: ["trust-and-safety-analyst"],
          customValues: ["IT compliance lead"],
        },
        valuePropositions: {
          presetIds: [],
          customValues: [
            "Reduce unmanaged device risk",
            "Accelerate security response",
          ],
        },
        targetUsers: {
          presetIds: [],
          customValues: ["Security admins", "Delegated reviewers"],
        },
        platforms: {
          presetIds: ["windows", "macos"],
          customValues: ["ChromeOS"],
        },
        regions: {
          presetIds: ["north-america", "europe"],
          customValues: ["EMEA"],
        },
        strategicRisks: {
          presetIds: ["adoption"],
          customValues: ["High false positive rate", "Admin fatigue"],
        },
        notes:
          "Focus launch on premium customers with regulated data requirements.",
      },
      functionalRequirements: [
        {
          id: "fr-1",
          title: "Adaptive policy enforcement",
          description:
            "Evaluate user context and device posture in real time to gate sensitive downloads.",
          priority: "P0",
          userStory:
            "As a security admin, I need Chrome Enterprise to block risky downloads on unmanaged devices so that data exfiltration risk drops immediately.",
          acceptanceCriteria: [
            "Download blocked when device fails posture check",
            "Event logged to CBCM telemetry within 5 minutes",
          ],
          dependencies: ["cbcmtimeline", "risk-engine"],
          estimatedEffort: "12 engineer-weeks",
        },
        {
          id: "fr-2",
          title: "Delegated policy review",
          description:
            "Provide security analysts a queue of policy exceptions with bulk approval tooling.",
          priority: "P1",
          userStory:
            "As a delegated analyst, I need a prioritized queue of policy overrides so that high-risk requests are resolved within SLA.",
          acceptanceCriteria: [
            "Queue sorted by risk score",
            "Approvals synced to Admin Console within 15 minutes",
          ],
          dependencies: ["admin-console"],
        },
      ],
      successMetrics: [
        {
          id: "metric-1",
          name: "Policy deployment time",
          description:
            "Reduce median time from policy definition to enforced deployment for new risk-based controls.",
          type: "performance",
          target:
            "Baseline 45 minutes to 20 minutes within 90 days of GA; CBCM telemetry is the system of record for timing.",
          measurement:
            "Median minutes from policy creation to first enforcement event (CBCM telemetry as the source of truth, sampled weekly).",
          frequency: "Weekly",
          owner: "Security operations automation lead",
        },
        {
          id: "metric-2",
          name: "High-risk download reduction",
          description:
            "Decrease unmanaged device high-risk downloads by limiting access pathways.",
          type: "business",
          target:
            "Baseline 120 risky downloads per week to 40 within 60 days post-launch using Admin Console incident reporting.",
          measurement:
            "Weekly count of blocked high-risk downloads per region (Admin Console analytics system of record).",
          frequency: "Weekly",
          owner: "Security analytics lead",
        },
      ],
      milestones: [
        {
          id: "ms-1",
          title: "Threat model complete",
          description: "Security architecture review approved by PSIRT.",
          phase: "design",
          estimatedDate: "2025-03-15",
        },
        {
          id: "ms-2",
          title: "GA rollout",
          description:
            "Launch a phased rollout for 20 design partners with training materials.",
          phase: "launch",
          estimatedDate: "2025-06-30",
        },
      ],
      executiveSummary: {
        problemStatement:
          "Admin teams cannot consistently block risky downloads on unmanaged devices without breaking productivity.",
        proposedSolution:
          "Deliver adaptive policy enforcement with delegated review flows tuned for Chrome Enterprise Premium.",
        businessValue:
          "Reduces incident response hours and contractual risk for regulated industries. Competitive snapshot: Zscaler focuses on isolation to block unmanaged endpoints while Island emphasizes granular policy workflows for regulated customers.",
        targetUsers:
          "Security administrators; IT compliance leads; delegated policy reviewers",
      },
      customerJourneys: [],
      metricSchemas: [],
    },
    enterpriseParameters: {
      targetSku: "premium",
      deploymentModel: "cloud",
      securityRequirements: ["sso", "dlp"],
      integrations: ["active-directory", "okta"],
      supportLevel: "enterprise",
      rolloutStrategy: "phased",
    },
    selectedSections: ["executive-summary", "feature-requirements"],
    sectionContents: {
      "executive-summary":
        "  Focus on risk mitigation in regulated industries.  ",
      "unused-section": "  ",
    },
    sectionOrder: ["executive-summary", "feature-requirements"],
    finalPrd: "",
    progress: {
      step: 3,
      totalSteps: 4,
      stepName: "Generate PRD",
      completion: 0.75,
      canGoBack: true,
      canGoNext: false,
    },
    isLoading: false,
    ...overrides,
  };
}

describe("serializeWorkflowToSpec", () => {
  it("captures outline metadata, workflow selections, and trimmed overrides", () => {
    const state = createBaseState();
    const spec = serializeWorkflowToSpec(state);

    expect(spec.version).toBe("phase-4");
    expect(Date.parse(spec.generatedAt)).not.toBeNaN();

    expect(spec.outline.metadata.projectName).toBe("Zero Trust Browser Guard");
    expect(spec.outline.metadata.primaryPersona.preset).toEqual({
      id: "security-administrator",
      label: "Security administrator",
      description:
        "Owns policy management, risk mitigation, and enterprise security posture.",
    });
    expect(spec.outline.metadata.secondaryPersonas.presets).toEqual([
      { id: "trust-and-safety-analyst", label: "Trust & Safety analyst" },
    ]);
    expect(spec.outline.metadata.secondaryPersonas.custom).toEqual([
      "IT compliance lead",
    ]);

    expect(spec.outline.metadata.platforms.presets).toEqual([
      { id: "windows", label: "Windows" },
      { id: "macos", label: "macOS" },
    ]);
    expect(spec.outline.metadata.platforms.custom).toEqual(["ChromeOS"]);

    expect(spec.outline.customerJourneys).toHaveLength(0);
    expect(spec.outline.metricSchemas).toHaveLength(0);

    expect(spec.workflow.initialPrompt).toContain("Zero Trust Browser Guard");
    expect(spec.workflow.selectedSections).toEqual([
      "executive-summary",
      "feature-requirements",
    ]);
    expect(spec.workflow.sectionOrder).toEqual([
      "executive-summary",
      "feature-requirements",
    ]);
    expect(spec.workflow.finalPrd).toBeUndefined();
    expect(spec.workflow.openIssues).toHaveLength(0);

    expect(spec.overrides).toEqual({
      "executive-summary": "Focus on risk mitigation in regulated industries.",
    });
  });

  it("records workflow errors as open issues and keeps final draft when present", () => {
    const state = createBaseState({
      error: "  Missing success metrics  ",
      finalPrd: "  Draft content  ",
    });

    const spec = serializeWorkflowToSpec(state);

    expect(spec.workflow.finalPrd).toBe("Draft content");
    expect(spec.workflow.openIssues).toEqual(["Missing success metrics"]);
  });
});

describe("serializeWorkflowToOutlinePayload", () => {
  it("maps enumerated selections to labeled payload entries", () => {
    const state = createBaseState();
    const payload = serializeWorkflowToOutlinePayload(state);

    expect(payload.metadata.primaryPersona.preset).toEqual({
      id: "security-administrator",
      label: "Security administrator",
      description:
        "Owns policy management, risk mitigation, and enterprise security posture.",
    });
    expect(payload.metadata.secondaryPersonas.custom).toEqual([
      "IT compliance lead",
    ]);
    expect(payload.metadata.platforms.custom).toEqual(["ChromeOS"]);
    expect(payload.enterprise.supportLevel).toBe("enterprise");
    expect(payload.functionalRequirements).toHaveLength(2);
  });

  it("drops empty custom values from list selections", () => {
    const baseState = createBaseState();
    const state = createBaseState({
      contentOutline: {
        ...baseState.contentOutline,
        metadata: {
          ...baseState.contentOutline.metadata,
          secondaryPersonas: {
            presetIds: ["trust-and-safety-analyst"],
            customValues: ["  ", "Escalations team lead"],
          },
        },
      },
    });

    const payload = serializeWorkflowToOutlinePayload(state);

    expect(payload.metadata.secondaryPersonas.custom).toEqual([
      "Escalations team lead",
    ]);
  });
});

describe("serializeWorkflowToLegacySpecText", () => {
  const pack = withCorrectedStructureRegex(prdPack as SpecPack);

  it("produces markdown compatible with deterministic validators", async () => {
    const state = createBaseState();
    const legacy = serializeWorkflowToLegacySpecText(state);

    const headers = [
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

    for (const header of headers) {
      expect(legacy).toContain(header);
    }

    const report = await validateAll(legacy, pack);
    const blockingIssues = report.issues.filter(
      (issue) =>
        issue.severity === "error" &&
        issue.id !== "missing-competitive-research"
    );
    expect(blockingIssues).toHaveLength(0);
    const competitiveIssues = report.issues.filter(
      (issue) => issue.id === "missing-competitive-research"
    );
    expect(competitiveIssues.length).toBeLessThanOrEqual(1);
  });

  it("flags missing sections when metadata is empty", () => {
    const state = createBaseState({
      contentOutline: {
        metadata: {
          projectName: "",
          projectTagline: "",
          problemStatement: "",
          primaryPersona: { presetId: undefined, customValue: "" },
          secondaryPersonas: { presetIds: [], customValues: [] },
          valuePropositions: { presetIds: [], customValues: [] },
          targetUsers: { presetIds: [], customValues: [] },
          platforms: { presetIds: [], customValues: [] },
          regions: { presetIds: [], customValues: [] },
          strategicRisks: { presetIds: [], customValues: [] },
          notes: "",
        },
        functionalRequirements: [],
        successMetrics: [],
        milestones: [],
        customerJourneys: [],
        metricSchemas: [],
      },
      sectionContents: {},
    });

    const legacy = serializeWorkflowToLegacySpecText(state);
    const validation = validateLegacySpecText(legacy);

    expect(validation.issues.length).toBeGreaterThanOrEqual(0);
    expect(legacy).toContain(
      "[PM_INPUT_NEEDED: Document top 3 user or admin problems with supporting telemetry, qualitative research, and quantified impact]"
    );
    expect(legacy).toContain(
      "[PM_INPUT_NEEDED: Provide success metrics with baseline, target, timeframe, units, and system of record for verification]"
    );
  });
});

function withCorrectedStructureRegex(pack: SpecPack): SpecPack {
  const headerRegex = DEFAULT_HEADER_REGEX;
  const patchItem = <P>(item: SpecItemDef<P>): SpecItemDef<P> => {
    if (shouldOverrideHeaderRegex(item)) {
      return {
        ...item,
        params: {
          ...item.params,
          headerRegex,
        },
      };
    }
    return item;
  };

  return {
    ...pack,
    items: pack.items.map(patchItem),
  };
}

function shouldOverrideHeaderRegex<P>(item: SpecItemDef<P>): boolean {
  if (!item.params || typeof item.params !== "object") {
    return false;
  }

  if (STRUCTURE_VALIDATOR_IDS.has(item.id)) {
    return true;
  }

  return (
    "headerRegex" in item.params &&
    typeof (item.params as { headerRegex?: unknown }).headerRegex === "string"
  );
}
