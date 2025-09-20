import React from "react";

import type { AgenticWorkflowState } from "@/hooks/use-agentic-workflow";
import type { StructuredOutline } from "@/lib/agents/types";

import {
  CompletePhase,
  DraftPhase,
  ErrorPhase,
  IdeaPhase,
  OutlinePhase,
} from "../phases";

export interface PhaseActions {
  setBrief: (brief: string) => void;
  onBriefSubmit: () => void;
  onOutlineEdit: (outline: StructuredOutline) => void;
  onGenerateDraft: () => void;
  onEditBrief: () => void;
  onReset: () => void;
}

type PhaseComponent = (props: {
  state: AgenticWorkflowState;
  actions: PhaseActions;
}) => React.ReactElement;

const phaseComponents: Record<AgenticWorkflowState["phase"], PhaseComponent> = {
  idea: ({ state, actions }) => (
    <IdeaPhase
      state={state}
      setBrief={actions.setBrief}
      onSubmit={actions.onBriefSubmit}
    />
  ),
  outline: ({ state, actions }) => (
    <OutlinePhase
      state={state}
      onEdit={actions.onOutlineEdit}
      onGenerate={actions.onGenerateDraft}
      onEditBrief={actions.onEditBrief}
    />
  ),
  draft: ({ state }) => <DraftPhase state={state} />,
  evaluating: ({ state }) => <DraftPhase state={state} />,
  refining: ({ state }) => <DraftPhase state={state} />,
  complete: ({ state, actions }) => (
    <CompletePhase state={state} onReset={actions.onReset} />
  ),
  error: ({ state, actions }) => (
    <ErrorPhase state={state} onReset={actions.onReset} />
  ),
};

export function renderPhaseContent(
  state: AgenticWorkflowState,
  actions: PhaseActions
): React.ReactElement {
  const PhaseComponent = phaseComponents[state.phase];
  return <PhaseComponent state={state} actions={actions} />;
}
