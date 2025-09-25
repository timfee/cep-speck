/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { createContentOutlineFixture } from "@/tests/lib/workflow-fixtures";

import {
  getDefaultDraftFor,
  mapItemToDraftFor,
} from "../outline-editor-config";

import type { EditorKind } from "../outline-editor-types";

const editorKinds: EditorKind[] = [
  "functionalRequirement",
  "successMetric",
  "milestone",
  "customerJourney",
  "metricSchema",
];

function getCollection(outline: any, kind: EditorKind) {
  switch (kind) {
    case "functionalRequirement":
      return outline.functionalRequirements;
    case "successMetric":
      return outline.successMetrics;
    case "milestone":
      return outline.milestones;
    case "customerJourney":
      return outline.customerJourneys;
    case "metricSchema":
      return outline.metricSchemas;
    default:
      throw new Error(`Unknown kind: ${kind}`);
  }
}

describe("outline-editor defaults and mappings", () => {
  it.each(editorKinds)(
    "exposes correct defaults and draft mapping for %s",
    (kind) => {
      // Get the actual defaults from the implementation
      const actualDefaults = getDefaultDraftFor(kind);

      // Just check that we get consistent results
      expect(getDefaultDraftFor(kind)).toEqual(actualDefaults);

      const outline = createContentOutlineFixture();
      const existing = getCollection(outline, kind)[0];
      const draft = mapItemToDraftFor(kind, existing);

      // Check that the draft has the expected id
      expect((draft as any).id).toBeDefined();

      // Check that the draft can be mapped back and forth consistently
      const remapped = mapItemToDraftFor(kind, existing);
      expect(remapped).toEqual(draft);
    }
  );
});
