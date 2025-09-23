import type { StructuredWorkflowState } from "@/types/workflow";

export type SectionContentMap = Record<string, string>;

export interface SectionDefinition {
  readonly title: string;
  readonly overrideKeys: readonly string[];
  readonly placeholder: string;
  build(
    state: StructuredWorkflowState,
    overrides: SectionContentMap
  ): string | null;
}
