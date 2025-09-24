import React from "react";

import type { ContentOutline } from "@/types/workflow";

import { ContentSection } from "./content-section";
import { SECTION_CONFIGS } from "./content-sections-config";
import type { FormComponentProps } from "./inline-editor-panel";
import { CustomerJourneyForm } from "../hooks/customer-journey-form";
import { FunctionalRequirementForm } from "../hooks/functional-requirement-form";
import { MetricSchemaForm } from "../hooks/metric-schema-form";
import { MilestoneForm } from "../hooks/milestone-form";

import {
  EDITOR_KINDS,
  type DraftForKind,
  type EditorKind,
  type EditorState,
  type EditorValues,
  type ItemForKind,
  type StateForKind,
} from "../hooks/outline-editor-types";

import { SuccessMetricForm } from "../hooks/success-metric-form";
import type { OutlineEditorHandlerMap } from "../hooks/use-outline-step-handlers";

type OutlineDeleteHandlers = Partial<Record<EditorKind, (id: string) => void>>;

type FormComponentMap = {
  [K in EditorKind]: React.ComponentType<FormComponentProps<DraftForKind<K>>>;
};

const FORM_COMPONENTS: FormComponentMap = {
  functionalRequirement: FunctionalRequirementForm,
  successMetric: SuccessMetricForm,
  milestone: MilestoneForm,
  customerJourney: CustomerJourneyForm,
  metricSchema: MetricSchemaForm,
};

const getFormComponent = <K extends EditorKind>(kind: K) =>
  FORM_COMPONENTS[kind];

interface ContentSectionsProps {
  contentOutline: ContentOutline;
  handlersByKind: OutlineEditorHandlerMap;
  deleteHandlers?: OutlineDeleteHandlers;
  editorState: EditorState | null;
  onCancelEditor: () => void;
  onSubmitEditor: (values: EditorValues) => void;
}

export function ContentSections(props: ContentSectionsProps) {
  const {
    contentOutline,
    handlersByKind,
    deleteHandlers = {},
    editorState,
    onCancelEditor,
    onSubmitEditor,
  } = props;

  const resolveEditorProps = <K extends EditorKind>(
    kind: K
  ): FormComponentProps<DraftForKind<K>> | undefined => {
    if (editorState?.kind !== kind) {
      return undefined;
    }

    const typedState = editorState as StateForKind<K>;
    const initialValues = typedState.data as DraftForKind<K>;
    return {
      mode: typedState.mode,
      initialValues,
      onCancel: onCancelEditor,
      onSubmit: (values: DraftForKind<K>) => onSubmitEditor(values),
    };
  };

  const renderSection = <K extends EditorKind>(kind: K) => {
    const {
      title,
      icon,
      addLabel,
      itemLabel,
      emptyMessage,
      renderer,
      selectItems,
    } = SECTION_CONFIGS[kind];

    const { handleAdd, handleEdit } = handlersByKind[kind];
    const FormComponent = getFormComponent(kind);
    const editor = resolveEditorProps(kind);
    const items = selectItems(contentOutline) as ItemForKind<K>[];
    const renderItem = renderer as (item: ItemForKind<K>) => {
      id: string;
      title: string;
      description: string;
      badge: React.ReactNode;
      extra?: React.ReactNode;
    };

    return (
      <ContentSection<ItemForKind<K>, DraftForKind<K>>
        key={kind}
        title={title}
        icon={icon}
        items={items}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={deleteHandlers[kind]}
        emptyMessage={emptyMessage}
        renderItem={renderItem}
        addLabel={addLabel}
        itemLabel={itemLabel}
        FormComponent={FormComponent}
        editor={editor}
      />
    );
  };

  return <>{EDITOR_KINDS.map((kind) => renderSection(kind))}</>;
}
