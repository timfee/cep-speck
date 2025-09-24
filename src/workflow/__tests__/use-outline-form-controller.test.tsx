/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { act, renderHook } from "@testing-library/react";
import React from "react";

import type { SubmitCallbackMap } from "@/lib/workflow/outline-editor-callbacks";
import type { ContentOutline } from "@/types/workflow";

import { useOutlineEditorManager } from "../steps/hooks/outline-editor-manager";
import type { EditorState } from "../steps/hooks/outline-editor-types";

jest.mock("../steps/hooks/outline-editor-callbacks", () => ({
  commitEditorItem: jest.fn(),
}));

jest.mock("@/lib/workflow/outline-editor-config", () => ({
  buildItemFromDraft: jest.fn(),
}));

jest.mock("@/lib/workflow/outline-editor-state", () => ({
  useEditorStateController: jest.fn(),
  getExistingId: jest.fn(),
}));

const { commitEditorItem } = jest.requireMock(
  "../steps/hooks/outline-editor-callbacks"
);
const { buildItemFromDraft } = jest.requireMock(
  "@/lib/workflow/outline-editor-config"
);
const { useEditorStateController, getExistingId } = jest.requireMock(
  "@/lib/workflow/outline-editor-state"
);

(globalThis as typeof globalThis & { React: typeof React }).React = React;

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

const createSubmitCallbacks = (): SubmitCallbackMap => ({
  functionalRequirement: {},
  successMetric: {},
  milestone: {},
  customerJourney: {},
  metricSchema: {},
});

describe("useOutlineEditorManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("builds editor items with fallback ids before dispatching", () => {
    const closeEditor = jest.fn();
    const editorState: EditorState = {
      kind: "functionalRequirement",
      mode: "edit",
      data: {
        id: undefined,
        title: "Draft title",
        description: "Draft description",
        priority: "P1",
        userStory: "",
        acceptanceCriteria: [],
        dependencies: [],
        estimatedEffort: "",
      },
    };
    const submission = {
      ...editorState.data,
      id: "temp-id",
    };

    (useEditorStateController as jest.Mock).mockReturnValue({
      editorState,
      openEditor: jest.fn(),
      closeEditor,
    });

    (getExistingId as jest.Mock)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce("temp-id");

    (buildItemFromDraft as jest.Mock).mockReturnValue({
      id: "final-id",
      title: "Draft title",
      description: "Draft description",
      priority: "P1",
    });

    const onChange = jest.fn();
    const submitCallbacks = createSubmitCallbacks();

    const { result } = renderHook(() =>
      useOutlineEditorManager({
        contentOutline: createMinimalOutline(),
        onChange,
        submitCallbacks,
      })
    );

    act(() => {
      result.current.submitEditor(submission);
    });

    expect(buildItemFromDraft).toHaveBeenCalledWith(
      editorState.kind,
      submission,
      "temp-id"
    );

    expect(commitEditorItem).toHaveBeenCalledWith({
      kind: editorState.kind,
      mode: editorState.mode,
      item: expect.objectContaining({ id: "final-id" }),
      callbacks: submitCallbacks[editorState.kind],
      contentOutline: expect.any(Object),
      onChange,
    });

    expect(closeEditor).toHaveBeenCalledTimes(1);
  });

  it("no-ops when no editor state is active", () => {
    (useEditorStateController as jest.Mock).mockReturnValue({
      editorState: null,
      openEditor: jest.fn(),
      closeEditor: jest.fn(),
    });

    const { result } = renderHook(() =>
      useOutlineEditorManager({
        contentOutline: createMinimalOutline(),
        onChange: jest.fn(),
        submitCallbacks: createSubmitCallbacks(),
      })
    );

    act(() => {
      result.current.submitEditor({} as never);
    });

    expect(commitEditorItem).not.toHaveBeenCalled();
    expect(buildItemFromDraft).not.toHaveBeenCalled();
  });
});
