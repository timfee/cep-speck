import { createNewCustomerJourney } from "../../customer-journey-helpers";
import { createNewFunctionalRequirement } from "../../functional-requirement-helpers";
import { createNewSuccessMetricSchema } from "../../metric-schema-helpers";
import { createNewMilestone } from "../../milestone-helpers";
import { createNewSuccessMetric } from "../../success-metric-helpers";

import {
  buildItemFromDraft,
  mapItemToDraftFor,
} from "../outline-editor-config";

import type { EditorKind, ItemForKind } from "../outline-editor-types";

type RoundTripCase<K extends EditorKind> = {
  kind: K;
  factory: () => ItemForKind<K>;
};

const roundTripCases: ReadonlyArray<
  | RoundTripCase<"functionalRequirement">
  | RoundTripCase<"successMetric">
  | RoundTripCase<"milestone">
  | RoundTripCase<"customerJourney">
  | RoundTripCase<"metricSchema">
> = [
  {
    kind: "functionalRequirement",
    factory: () =>
      createNewFunctionalRequirement({
        title: "Enable secure SSO",
        description:
          "Allow enterprise users to sign in with their SSO provider.",
        priority: "P0",
        userStory:
          "As an IT admin, I need SSO support to manage access centrally.",
        acceptanceCriteria: [
          "Supports Okta and Azure AD",
          "Logs every login attempt",
        ],
        dependencies: ["Identity service"],
        estimatedEffort: "8d",
      }),
  },
  {
    kind: "successMetric",
    factory: () =>
      createNewSuccessMetric({
        name: "Activation rate",
        description: "Share of new workspaces that complete onboarding.",
        type: "business",
        target: "75%",
        measurement: "Rolling 30-day cohort",
        frequency: "monthly",
        owner: "Product analytics",
      }),
  },
  {
    kind: "milestone",
    factory: () =>
      createNewMilestone({
        title: "Beta launch",
        description: "Release feature to beta customers.",
        phase: "launch",
        estimatedDate: "2025-04-15",
        dependencies: ["QA sign-off"],
        deliverables: ["Release checklist", "Beta feedback form"],
      }),
  },
  {
    kind: "customerJourney",
    factory: () =>
      createNewCustomerJourney({
        title: "Trial signup",
        role: "Prospective buyer",
        goal: "Start a product trial in minutes.",
        successCriteria: "Trial account is ready without contacting support.",
        steps: [
          { id: "step-1", description: "Visit marketing site" },
          { id: "step-2", description: "Complete signup form" },
        ],
        painPoints: ["Unsure about pricing tiers"],
      }),
  },
  {
    kind: "metricSchema",
    factory: () =>
      createNewSuccessMetricSchema({
        title: "Activation schema",
        description: "Fields describing workspace activation.",
        fields: [
          {
            id: "field-1",
            name: "workspaceId",
            description: "Unique workspace identifier.",
            dataType: "string",
            required: true,
            allowedValues: ["alpha", "beta"],
            sourceSystem: "warehouse",
          },
        ],
      }),
  },
];

describe("outline editor config round-trips", () => {
  for (const { kind, factory } of roundTripCases) {
    it(`round-trips a ${kind} item through draft transforms`, () => {
      const item = factory();
      const draft = mapItemToDraftFor(kind, item);
      expect(draft.id).toBe(item.id);

      const rebuilt = buildItemFromDraft(kind, draft, item.id);
      expect(rebuilt).toEqual(item);
    });
  }
});
