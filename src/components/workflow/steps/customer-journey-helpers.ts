import type { CustomerJourney, CustomerJourneyStep } from "@/types/workflow";

import type { CustomerJourneyDraft } from "./hooks/outline-editor-types";
import type { OutlineEntityDescriptor } from "./outline-entity-descriptor";
import { createOutlineId } from "./outline-id";

import {
  normalizeOptionalString,
  requireMeaningfulField,
} from "./outline-text-utils";

export interface CustomerJourneyInput
  extends Pick<CustomerJourney, "title" | "role" | "goal">,
    Partial<Omit<CustomerJourney, "id" | "title" | "role" | "goal" | "steps">> {
  steps?: Array<Partial<CustomerJourneyStep>>;
  id?: string;
}

const sanitizeSteps = (
  steps: CustomerJourneyInput["steps"]
): CustomerJourneyStep[] => {
  if (!steps) {
    return [];
  }

  return steps
    .map((step) => ({
      id: step.id ?? createOutlineId("cjs-step"),
      description: (step.description ?? "").trim(),
    }))
    .filter((step) => step.description.length > 0);
};

const sanitizePainPoints = (painPoints?: string[]): string[] => {
  if (!painPoints) {
    return [];
  }

  return painPoints
    .map((point) => point.trim())
    .filter((point) => point.length > 0);
};

export function createNewCustomerJourney(
  input: CustomerJourneyInput
): CustomerJourney {
  const title = requireMeaningfulField(input.title, {
    empty: "Customer journeys need a title so PMs can tell scenarios apart.",
    placeholder: "Provide a clear scenario title for the journey.",
  });
  const role = requireMeaningfulField(input.role, {
    empty: "Customer journeys should list the acting role persona.",
    placeholder: "Specify the persona or role completing this journey.",
  });
  const goal = requireMeaningfulField(input.goal, {
    empty: "Customer journeys must explain the user's goal.",
    placeholder: "Describe what the persona is trying to accomplish.",
  });

  return {
    id: createOutlineId("cjs"),
    title,
    role,
    goal,
    successCriteria: normalizeOptionalString(input.successCriteria),
    steps: sanitizeSteps(input.steps),
    painPoints: sanitizePainPoints(input.painPoints),
  };
}

export const customerJourneyDescriptor: OutlineEntityDescriptor<
  CustomerJourney,
  CustomerJourneyDraft
> = {
  idKey: "id",
  defaults: () => ({
    title: "",
    role: "",
    goal: "",
    steps: [],
    painPoints: [],
  }),
  toDraft: (item) => ({
    id: item.id,
    title: item.title,
    role: item.role,
    goal: item.goal,
    successCriteria: item.successCriteria,
    steps: item.steps.map((step) => ({
      id: step.id,
      description: step.description,
    })),
    painPoints: item.painPoints ?? [],
  }),
  fromDraft: (draft, fallbackId) => {
    const created = createNewCustomerJourney({
      title: draft.title,
      role: draft.role,
      goal: draft.goal,
      successCriteria: draft.successCriteria,
      steps: draft.steps,
      painPoints: draft.painPoints,
    });

    const id = draft.id ?? fallbackId ?? created.id;
    return { ...created, id };
  },
};
