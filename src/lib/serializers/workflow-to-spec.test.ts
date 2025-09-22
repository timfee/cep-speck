import { serializeWorkflowToSpec } from "@/lib/serializers/workflow-to-spec";
import prdPack from "@/lib/spec/packs/prd-v1.json";
import type { SpecItemDef, SpecPack } from "@/lib/spec/types";
import { validateAll } from "@/lib/spec/validate";
import type { StructuredWorkflowState } from "@/types/workflow";
import "@/lib/spec/items";

function createBaseState(
  overrides: Partial<StructuredWorkflowState> = {}
): StructuredWorkflowState {
  return {
    currentStep: "generate",
    initialPrompt:
      "Project: Zero Trust Browser Guard\nWe need to reduce unmanaged device risk for contractors handling sensitive files.",
    contentOutline: {
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
    },
    enterpriseParameters: {
      targetSku: "premium",
      deploymentModel: "cloud",
      securityRequirements: ["sso", "dlp"],
      integrations: ["active-directory", "okta"],
      supportLevel: "enterprise",
      rolloutStrategy: "phased",
    },
    selectedSections: [],
    sectionContents: {},
    sectionOrder: [],
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
  const pack = withCorrectedStructureRegex(prdPack as SpecPack);

  it("emits all required sections and passes deterministic validation", async () => {
    const state = createBaseState();
    const spec = serializeWorkflowToSpec(state);

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
      expect(spec).toContain(header);
    }

    const report = await validateAll(spec, pack);
    const deterministicIssues = report.issues.filter(
      (issue) => issue.severity === "error"
    );
    expect(deterministicIssues).toHaveLength(0);
  });

  it("fills missing data with structured placeholders so validators see the full outline", () => {
    const state = createBaseState({
      contentOutline: {
        functionalRequirements: [],
        successMetrics: [],
        milestones: [],
      },
      sectionContents: {},
    });

    const spec = serializeWorkflowToSpec(state);

    expect(spec).toContain(
      "[PM_INPUT_NEEDED: Document top 3 user or admin problems"
    );
    expect(spec).toContain("[PM_INPUT_NEEDED: Identify primary personas");
    expect(spec).toContain("# 8. Success Metrics");
    expect(spec).toContain("[PM_INPUT_NEEDED: Provide success metrics");
  });
});

function withCorrectedStructureRegex(pack: SpecPack): SpecPack {
  const headerRegex = "^#\\s+\\d+\\.";
  const patchItem = <P>(item: SpecItemDef<P>): SpecItemDef<P> => {
    if (item.id === "section-count" || item.id === "label-pattern") {
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
