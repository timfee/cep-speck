import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { StructuredOutline } from "@/lib/agents";

import {
  DEFAULT_SECTION_TEMPLATE,
  EMPTY_OUTLINE,
  type EditableOutlineSection,
  type StructuredWorkflowState,
} from "@/types/workflow";

type SetState = Dispatch<SetStateAction<StructuredWorkflowState>>;

export function useOutlineActions(setState: SetState) {
  const applyOutlineUpdate = useCallback(
    (updater: (outline: StructuredOutline) => StructuredOutline) => {
      setState((prev) => {
        const current = prev.outline ?? EMPTY_OUTLINE;
        const nextOutline = updater({
          sections: [...current.sections],
        });

        return {
          ...prev,
          outline: nextOutline,
          draft: "",
          finalDraft: "",
          evaluationReport: null,
          iteration: 0,
        };
      });
    },
    [setState]
  );

  const setOutline = useCallback(
    (outline: StructuredOutline) => {
      setState((prev) => ({
        ...prev,
        outline,
        draft: "",
        finalDraft: "",
        evaluationReport: null,
        iteration: 0,
      }));
    },
    [setState]
  );

  const addSection = useCallback(() => {
    const id = `section-${Date.now()}`;
    applyOutlineUpdate((outline) => ({
      sections: [...outline.sections, { ...DEFAULT_SECTION_TEMPLATE, id }],
    }));
  }, [applyOutlineUpdate]);

  const updateSection = useCallback(
    (id: string, updates: Partial<EditableOutlineSection>) => {
      applyOutlineUpdate((outline) => ({
        sections: outline.sections.map((section) =>
          section.id === id ? { ...section, ...updates } : section
        ),
      }));
    },
    [applyOutlineUpdate]
  );

  const removeSection = useCallback(
    (id: string) => {
      applyOutlineUpdate((outline) => ({
        sections: outline.sections.filter((section) => section.id !== id),
      }));
    },
    [applyOutlineUpdate]
  );

  const moveSection = useCallback(
    (fromIndex: number, toIndex: number) => {
      applyOutlineUpdate((outline) => {
        const sections = [...outline.sections];
        if (
          fromIndex < 0 ||
          fromIndex >= sections.length ||
          toIndex < 0 ||
          toIndex >= sections.length
        ) {
          return outline;
        }

        const [moved] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, moved);
        return { sections };
      });
    },
    [applyOutlineUpdate]
  );

  return {
    setOutline,
    addSection,
    updateSection,
    removeSection,
    moveSection,
  } as const;
}
