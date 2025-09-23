/**
 * Integration tests for streaming payloads and outline editing/serialization flows
 *
 * Tests the full workflow from outline editing through serialization to prompt contracts,
 * including streaming frame handling and timeline progress indicators.
 */

import { serializeWorkflowToSpec } from "@/lib/serializers/workflow-to-spec";
import { serializeWorkflowToOutlinePayload } from "@/lib/serializers/workflow-to-structured-outline";

import {
  getProgressForPhase,
  getPhaseDescription,
} from "@/lib/spec/helpers/phase-processing";

import { StreamProcessor } from "@/lib/spec/helpers/streaming";

import {
  createPhaseFrame,
  createGenerationFrame,
  createResultFrame,
} from "@/lib/spec/streaming";

import type { StreamFrame, StreamPhase } from "@/lib/spec/types";

import type {
  StructuredWorkflowState,
  OutlineMetadata,
  FunctionalRequirement,
  SuccessMetric,
  CustomerJourney,
  SerializedWorkflowOutline,
  SerializedWorkflowSpec,
} from "@/types/workflow";

// Mock drafter that emits delta frames for testing
class MockDrafter {
  private readonly phases: StreamPhase[] = [
    "loading-knowledge",
    "performing-research",
    "generating",
    "validating",
    "healing",
    "done",
  ];

  async *generateStreamingFrames(): AsyncGenerator<StreamFrame> {
    for (const phase of this.phases) {
      // Emit phase change
      yield createPhaseFrame(phase, 1);

      // For generating phase, emit multiple delta frames
      if (phase === "generating") {
        const deltas = [
          "# 1. TL;DR\n\n",
          "This PRD outlines a new feature for enterprise security management.\n\n",
          "## Problem Statement\n\n",
          "Security teams need better visibility into policy compliance.\n\n",
          "# 2. People Problems\n\n",
          "Current tools lack integration with existing workflows.\n\n",
        ];

        for (const delta of deltas) {
          yield createGenerationFrame(delta, "", 0);

          // Simulate processing delay
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      // Simulate phase completion delay
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    // Final result
    yield createResultFrame(
      true,
      "# 1. TL;DR\n\nThis PRD outlines a new feature for enterprise security management.\n\n## Problem Statement\n\nSecurity teams need better visibility into policy compliance.\n\n# 2. People Problems\n\nCurrent tools lack integration with existing workflows.",
      1,
      100
    );
  }

  // Convert async generator to array for testing
  async generateMockFrames(): Promise<StreamFrame[]> {
    const frames: StreamFrame[] = [];
    for await (const frame of this.generateStreamingFrames()) {
      frames.push(frame);
    }
    return frames;
  }
}

// Test workflow state factory
function createTestWorkflowState(
  overrides: Partial<StructuredWorkflowState> = {}
): StructuredWorkflowState {
  const defaultMetadata: OutlineMetadata = {
    projectName: "Advanced Security Monitoring",
    projectTagline: "Next-generation enterprise security visibility",
    problemStatement:
      "Security teams lack comprehensive visibility into policy compliance across distributed systems",
    primaryPersona: {
      presetId: "security-administrator",
      customValue: "",
      useCustom: false,
    },
    secondaryPersonas: {
      presetIds: ["secops-analyst", "compliance-specialist"],
      customValues: ["Custom SecOps Role"],
    },
    valuePropositions: {
      presetIds: ["faster-detection", "stronger-compliance"],
      customValues: [],
    },
    targetUsers: {
      presetIds: ["security-operations"],
      customValues: [],
    },
    platforms: {
      presetIds: ["chrome", "windows"],
      customValues: ["Custom Platform"],
    },
    regions: {
      presetIds: ["north-america", "europe"],
      customValues: [],
    },
    strategicRisks: {
      presetIds: ["security", "compliance"],
      customValues: ["Custom risk consideration"],
    },
    notes: "Additional context for the drafter team",
  };

  const defaultFunctionalRequirement: FunctionalRequirement = {
    id: "fr-001",
    title: "Core Security Monitoring",
    description: "Real-time monitoring of security events",
    priority: "P0",
    userStory: "As a security admin, I want real-time monitoring",
    acceptanceCriteria: [
      "Event detection",
      "Alert generation",
      "Dashboard display",
    ],
  };

  const defaultSuccessMetric: SuccessMetric = {
    id: "sm-001",
    name: "Detection Accuracy",
    description: "Percentage of true positive security alerts",
    type: "performance",
    target: "95%",
    measurement: "True positive rate from security analytics",
    frequency: "Monthly",
    owner: "Security Operations Team",
  };

  const defaultCustomerJourney: CustomerJourney = {
    id: "cj-001",
    title: "Security Incident Response",
    description: "How security teams respond to detected threats",
    steps: [
      { order: 1, action: "Alert received", actor: "Security Analyst" },
      { order: 2, action: "Incident investigation", actor: "Security Analyst" },
      { order: 3, action: "Response coordination", actor: "Security Lead" },
    ],
  };

  return {
    currentStep: "content-outline",
    initialPrompt: "Develop enterprise security monitoring capabilities",
    contentOutline: {
      projectName: "Advanced Security Monitoring",
      targetSku: "premium",
      supportLevel: "full",
      rolloutStrategy: "phased",
      milestones: [
        {
          id: "m1",
          name: "Phase 1 - Core Implementation",
          description: "Basic monitoring infrastructure",
          timeline: "Q1 2024",
          deliverables: ["Alert system", "Basic dashboard"],
        },
      ],
    },
    enterpriseParameters: {
      complianceFrameworks: ["SOC2", "ISO27001"],
      securityRequirements: ["Data encryption", "Access controls"],
      integrationConstraints: ["SAML SSO", "Active Directory"],
    },
    functionalRequirements: [defaultFunctionalRequirement],
    successMetrics: [defaultSuccessMetric],
    customerJourneys: [defaultCustomerJourney],
    outlineMetadata: defaultMetadata,
    finalPrd: "",
    ...overrides,
  };
}

describe("Streaming Payload Integration", () => {
  let streamProcessor: StreamProcessor;
  let mockDrafter: MockDrafter;

  beforeEach(() => {
    streamProcessor = new StreamProcessor();
    mockDrafter = new MockDrafter();
  });

  afterEach(() => {
    streamProcessor.reset();
  });

  test("processes streaming frames correctly with timeline progress indicators", async () => {
    const frames = await mockDrafter.generateMockFrames();

    // Track progress through phases
    const progressUpdates: Array<{
      phase: string;
      progress: number;
      description: string;
    }> = [];
    const generationDeltas: string[] = [];
    let finalDraft = "";

    // Process each frame
    for (const frame of frames) {
      const processedFrames = streamProcessor.processChunk(
        new TextEncoder().encode(JSON.stringify(frame) + "\n")
      );

      for (const processed of processedFrames) {
        switch (processed.type) {
          case "phase":
            progressUpdates.push({
              phase: processed.data.phase,
              progress: getProgressForPhase(processed.data.phase),
              description: getPhaseDescription(processed.data.phase),
            });
            break;

          case "generation":
            generationDeltas.push(processed.data.delta);
            break;

          case "result":
            finalDraft = processed.data.finalDraft;
            break;

          case "error":
          case "validation":
          case "self-review":
          default:
            // Handle other frame types that might be received
            break;
        }
      }
    }

    // Verify timeline progress indicators updated correctly
    expect(progressUpdates).toHaveLength(6);
    expect(progressUpdates[0]).toEqual({
      phase: "loading-knowledge",
      progress: 10,
      description: "Loading knowledge base...",
    });
    expect(progressUpdates[2]).toEqual({
      phase: "generating",
      progress: 40,
      description: "Creating PRD content...",
    });
    expect(progressUpdates[5]).toEqual({
      phase: "done",
      progress: 100,
      description: "PRD generation complete!",
    });

    // Verify generation deltas accumulated correctly
    expect(generationDeltas).toHaveLength(6);
    expect(generationDeltas.join("")).toContain("# 1. TL;DR");
    expect(generationDeltas.join("")).toContain("# 2. People Problems");

    // Verify final result
    expect(finalDraft).toContain("TL;DR");
    expect(finalDraft).toContain("People Problems");
  });

  test("handles incomplete JSON frames with buffering", () => {
    // Simulate partial frame transmission
    const partialFrame1 = '{"type":"phase","data":{"phase":"generating"';
    const partialFrame2 = ',"attempt":1}}';

    // Process first chunk - should not produce any frames
    const frames1 = streamProcessor.processChunk(
      new TextEncoder().encode(partialFrame1)
    );
    expect(frames1).toHaveLength(0);

    // Process second chunk - should complete the frame
    const frames2 = streamProcessor.processChunk(
      new TextEncoder().encode(partialFrame2 + "\n")
    );
    expect(frames2).toHaveLength(1);
    expect(frames2[0].type).toBe("phase");
    expect(frames2[0].data.phase).toBe("generating");
  });
});

describe("Outline Editing and Serialization Integration", () => {
  test("simulates full outline edit session and validates serialized JSON", () => {
    // Create initial workflow state
    const workflowState = createTestWorkflowState();

    // Simulate editing outline metadata (personas, platforms, custom entries)
    const editedState: StructuredWorkflowState = {
      ...workflowState,
      outlineMetadata: {
        ...workflowState.outlineMetadata,
        primaryPersona: {
          presetId: "compliance-officer",
          customValue: "",
          useCustom: false,
        },
        platforms: {
          presetIds: ["chrome", "edge", "safari"],
          customValues: ["Custom Enterprise Browser", "Legacy IE Support"],
        },
        strategicRisks: {
          presetIds: ["adoption", "operational"],
          customValues: [
            "Regulatory compliance risk",
            "Training adoption challenges",
          ],
        },
      },
      functionalRequirements: [
        ...workflowState.functionalRequirements,
        {
          id: "fr-002",
          title: "Compliance Reporting",
          description: "Automated compliance report generation",
          priority: "P1",
          userStory: "As a compliance officer, I want automated reports",
          acceptanceCriteria: [
            "Report templates",
            "Scheduled generation",
            "Audit trails",
          ],
        },
      ],
    };

    // Serialize to outline payload
    const outlinePayload: SerializedWorkflowOutline =
      serializeWorkflowToOutlinePayload(editedState);

    // Verify outline payload structure matches expected contract
    expect(outlinePayload.projectName).toBe("Advanced Security Monitoring");
    expect(outlinePayload.targetSku).toBe("premium");
    expect(outlinePayload.metadata).toBeDefined();
    expect(outlinePayload.metadata.primaryPersona).toEqual({
      id: "compliance-officer",
      label: "Compliance officer",
      isCustom: false,
      customValue: "",
    });

    // Verify custom entries are preserved
    expect(outlinePayload.metadata.platforms.customEntries).toContain(
      "Custom Enterprise Browser"
    );
    expect(outlinePayload.metadata.platforms.customEntries).toContain(
      "Legacy IE Support"
    );
    expect(outlinePayload.metadata.strategicRisks.customEntries).toContain(
      "Regulatory compliance risk"
    );

    // Verify functional requirements serialization
    expect(outlinePayload.functionalRequirements).toHaveLength(2);
    expect(outlinePayload.functionalRequirements[1].title).toBe(
      "Compliance Reporting"
    );

    // Serialize to spec format for backward compatibility
    const specPayload: SerializedWorkflowSpec =
      serializeWorkflowToSpec(editedState);

    // Verify spec payload contains outline payload
    expect(specPayload.outlinePayload).toEqual(outlinePayload);
    expect(specPayload.specText).toContain("Advanced Security Monitoring");
    expect(specPayload.specText).toContain("premium");
  });

  test("validates persona selection propagates through serialization", () => {
    // Test primary persona selection
    const workflowWithPrimaryPersona = createTestWorkflowState({
      outlineMetadata: {
        ...createTestWorkflowState().outlineMetadata,
        primaryPersona: {
          presetId: "product-manager",
          customValue: "",
          useCustom: false,
        },
      },
    });

    const serialized = serializeWorkflowToOutlinePayload(
      workflowWithPrimaryPersona
    );
    expect(serialized.metadata.primaryPersona.id).toBe("product-manager");
    expect(serialized.metadata.primaryPersona.label).toBe("Product manager");

    // Test custom primary persona
    const workflowWithCustomPersona = createTestWorkflowState({
      outlineMetadata: {
        ...createTestWorkflowState().outlineMetadata,
        primaryPersona: {
          presetId: "",
          customValue: "Chief Security Officer",
          useCustom: true,
        },
      },
    });

    const customSerialized = serializeWorkflowToOutlinePayload(
      workflowWithCustomPersona
    );
    expect(customSerialized.metadata.primaryPersona.isCustom).toBe(true);
    expect(customSerialized.metadata.primaryPersona.customValue).toBe(
      "Chief Security Officer"
    );
  });

  test("validates platform and region selections with custom entries", () => {
    const workflowWithCustomPlatforms = createTestWorkflowState({
      outlineMetadata: {
        ...createTestWorkflowState().outlineMetadata,
        platforms: {
          presetIds: ["chrome", "windows"],
          customValues: ["Embedded Browser", "Mobile WebView"],
        },
        regions: {
          presetIds: ["asia-pacific"],
          customValues: [
            "Antarctica Research Stations",
            "International Waters",
          ],
        },
      },
    });

    const serialized = serializeWorkflowToOutlinePayload(
      workflowWithCustomPlatforms
    );

    // Verify preset selections
    expect(serialized.metadata.platforms.presetOptions).toEqual([
      { id: "chrome", label: "Chrome" },
      { id: "windows", label: "Windows" },
    ]);

    // Verify custom entries
    expect(serialized.metadata.platforms.customEntries).toEqual([
      "Embedded Browser",
      "Mobile WebView",
    ]);

    expect(serialized.metadata.regions.customEntries).toEqual([
      "Antarctica Research Stations",
      "International Waters",
    ]);
  });
});

describe("End-to-End Workflow Integration", () => {
  test("complete workflow from editing to prompt generation", async () => {
    // 1. Start with base workflow state
    const initialState = createTestWorkflowState();

    // 2. Simulate user edits across multiple sections
    const editedState = createTestWorkflowState({
      contentOutline: {
        ...initialState.contentOutline,
        projectName: "Next-Gen Security Platform",
        targetSku: "enterprise",
      },
      functionalRequirements: [
        {
          id: "fr-001",
          title: "Multi-Tenant Security",
          description: "Tenant isolation and security boundaries",
          priority: "P0",
          userStory: "As an enterprise admin, I want tenant isolation",
          acceptanceCriteria: [
            "Data separation",
            "Access isolation",
            "Audit boundaries",
          ],
        },
      ],
      successMetrics: [
        {
          id: "sm-001",
          name: "Tenant Isolation Effectiveness",
          description: "Percentage of cross-tenant access attempts blocked",
          type: "performance",
          target: "99.9%",
          measurement: "Cross-tenant access attempts blocked",
          frequency: "Monthly",
          owner: "Security Monitoring System",
        },
      ],
    });

    // 3. Serialize final state
    const outlinePayload = serializeWorkflowToOutlinePayload(editedState);
    const specPayload = serializeWorkflowToSpec(editedState);

    // 4. Verify serialized data matches prompt contract expectations
    expect(outlinePayload.projectName).toBe("Next-Gen Security Platform");
    expect(outlinePayload.targetSku).toBe("enterprise");
    expect(outlinePayload.functionalRequirements[0].title).toBe(
      "Multi-Tenant Security"
    );
    expect(outlinePayload.successMetrics[0].target).toBe("99.9%");

    // 5. Verify spec text contains key elements for drafter
    expect(specPayload.specText).toContain("Next-Gen Security Platform");
    expect(specPayload.specText).toContain("enterprise");
    expect(specPayload.specText).toContain("Multi-Tenant Security");
    expect(specPayload.specText).toContain("99.9%");

    // 6. Simulate streaming workflow with mock drafter
    const mockDrafter = new MockDrafter();
    const frames = await mockDrafter.generateMockFrames();

    // Verify frames can be processed and produce expected timeline updates
    const processor = new StreamProcessor();
    let phaseCount = 0;
    let hasGenerationDeltas = false;
    let hasFinalResult = false;

    for (const frame of frames) {
      const processed = processor.processChunk(
        new TextEncoder().encode(JSON.stringify(frame) + "\n")
      );

      for (const processedFrame of processed) {
        switch (processedFrame.type) {
          case "phase":
            phaseCount++;
            break;
          case "generation":
            hasGenerationDeltas = true;
            break;
          case "result":
            hasFinalResult = true;
            break;
          case "error":
          case "validation":
          case "self-review":
          default:
            // Handle other frame types that might be received
            break;
        }
      }
    }

    expect(phaseCount).toBe(6); // All phases processed
    expect(hasGenerationDeltas).toBe(true); // Generation deltas received
    expect(hasFinalResult).toBe(true); // Final result received
  });
});
