import { useCallback } from "react";

import {
  serializeWorkflowToLegacySpecText,
  serializeWorkflowToSpec,
} from "@/lib/serializers/workflow-to-spec";

import { serializeWorkflowToOutlinePayload } from "@/lib/serializers/workflow-to-structured-outline";
import type { StructuredWorkflowState } from "@/types/workflow";

export function useWorkflowSerializers(state: StructuredWorkflowState) {
  const serializeToSpecPayload = useCallback(() => {
    return serializeWorkflowToSpec(state);
  }, [state]);

  const serializeToLegacySpecText = useCallback((): string => {
    return serializeWorkflowToLegacySpecText(state);
  }, [state]);

  const serializeToOutlinePayload = useCallback(() => {
    return serializeWorkflowToOutlinePayload(state);
  }, [state]);

  return {
    serializeToSpecPayload,
    serializeToLegacySpecText,
    serializeToOutlinePayload,
  };
}
