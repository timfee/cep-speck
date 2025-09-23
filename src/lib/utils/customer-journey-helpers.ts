import type { CustomerJourney, CustomerJourneyStep } from "@/types/workflow";

import {
  normalizeOptionalString,
  requireMeaningfulField,
} from "./outline-text-utils";

import { createOutlineId } from "../../components/workflow/steps/outline-id";

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
