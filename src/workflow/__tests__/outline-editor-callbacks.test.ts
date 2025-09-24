import { commitEditorItem } from "@/lib/workflow/outline-editor-callbacks";

import type {
  ContentOutline,
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
} from "@/types/workflow";

jest.mock("@/lib/workflow/outline-editor-config", () => ({
  addItemToOutline: jest.fn(),
  updateItemInOutline: jest.fn(),
}));

const { addItemToOutline, updateItemInOutline } = jest.requireMock(
  "@/lib/workflow/outline-editor-config"
) as {
  addItemToOutline: jest.Mock;
  updateItemInOutline: jest.Mock;
};

const createEmptySelection = () => ({
  presetIds: [] as string[],
  customValues: [] as string[],
});

const createMinimalOutline = (): ContentOutline => ({
  metadata: {
    projectName: "",
    projectTagline: "",
    problemStatement: "",
    notes: "",
    primaryPersona: { presetId: undefined, customValue: "", useCustom: false },
    secondaryPersonas: createEmptySelection(),
    valuePropositions: createEmptySelection(),
    targetUsers: createEmptySelection(),
    platforms: createEmptySelection(),
    regions: createEmptySelection(),
    strategicRisks: createEmptySelection(),
  },
  functionalRequirements: [],
  successMetrics: [],
  milestones: [],
  customerJourneys: [],
  metricSchemas: [],
});

describe("commitEditorItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("prefers explicit add callbacks when creating items", () => {
    const onAdd = jest.fn();
    const onChange = jest.fn();
    const outline = createMinimalOutline();
    const item: FunctionalRequirement = {
      id: "req-1",
      title: "Title",
      description: "Description",
      priority: "P1",
    };

    commitEditorItem({
      kind: "functionalRequirement",
      mode: "create",
      item,
      callbacks: { onAdd },
      contentOutline: outline,
      onChange,
    });

    expect(onAdd).toHaveBeenCalledWith(item);
    expect(onChange).not.toHaveBeenCalled();
    expect(addItemToOutline).not.toHaveBeenCalled();
  });

  it("falls back to outline updates when add callbacks are absent", () => {
    const outline = createMinimalOutline();
    const onChange = jest.fn();
    const item: SuccessMetric = {
      id: "metric-1",
      name: "Activation",
      description: "Activation metric",
      type: "engagement",
    };

    (addItemToOutline as jest.Mock).mockReturnValue({
      ...outline,
      successMetrics: [item],
    });

    commitEditorItem({
      kind: "successMetric",
      mode: "create",
      item,
      callbacks: {},
      contentOutline: outline,
      onChange,
    });

    expect(addItemToOutline).toHaveBeenCalledWith(
      "successMetric",
      outline,
      item
    );
    expect(onChange).toHaveBeenCalledWith({
      ...outline,
      successMetrics: [item],
    });
  });

  it("prefers explicit edit callbacks when updating items", () => {
    const outline = createMinimalOutline();
    const onEdit = jest.fn();
    const onChange = jest.fn();
    const item: Milestone = {
      id: "milestone-1",
      title: "Kickoff",
      description: "Kickoff milestone",
      phase: "design",
    };

    commitEditorItem({
      kind: "milestone",
      mode: "edit",
      item,
      callbacks: { onEdit },
      contentOutline: outline,
      onChange,
    });

    expect(onEdit).toHaveBeenCalledWith(item.id, item);
    expect(onChange).not.toHaveBeenCalled();
    expect(updateItemInOutline).not.toHaveBeenCalled();
  });

  it("falls back to outline updates when edit callbacks are absent", () => {
    const outline = createMinimalOutline();
    const onChange = jest.fn();
    const item: CustomerJourney = {
      id: "journey-1",
      title: "Adopt",
      role: "Admin",
      goal: "Adopt automation",
      steps: [],
    };

    (updateItemInOutline as jest.Mock).mockReturnValue({
      ...outline,
      customerJourneys: [item],
    });

    commitEditorItem({
      kind: "customerJourney",
      mode: "edit",
      item,
      callbacks: {},
      contentOutline: outline,
      onChange,
    });

    expect(updateItemInOutline).toHaveBeenCalledWith(
      "customerJourney",
      outline,
      item.id,
      item
    );
    expect(onChange).toHaveBeenCalledWith({
      ...outline,
      customerJourneys: [item],
    });
  });
});
