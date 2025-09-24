import type { ReactNode } from "react";

import { EmptyState } from "./empty-state";

import {
  InlineEditorPanel,
  type FormComponentProps,
} from "./inline-editor-panel";

import { ItemCard } from "./item-card";

interface SectionItemsProps<T, Draft> {
  items: T[];
  emptyMessage: string;
  renderItem: (item: T) => {
    id: string;
    title: string;
    description: string;
    badge: ReactNode;
    extra?: ReactNode;
  };
  itemLabel: string;
  FormComponent: React.ComponentType<FormComponentProps<Draft>>;
  editor?: FormComponentProps<Draft>;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const renderInlineEditor = <Draft,>(
  itemLabel: string,
  FormComponent: React.ComponentType<FormComponentProps<Draft>>,
  editor: FormComponentProps<Draft>,
  key: string
) => (
  <InlineEditorPanel
    key={key}
    itemLabel={itemLabel}
    FormComponent={FormComponent}
    mode={editor.mode}
    initialValues={editor.initialValues}
    onCancel={editor.onCancel}
    onSubmit={editor.onSubmit}
  />
);

const isEditingTarget = <Draft,>(
  editor: FormComponentProps<Draft> | undefined,
  id: string
) =>
  Boolean(
    editor?.mode === "edit" &&
      (editor.initialValues as { id?: string }).id === id
  );

export function SectionItems<T, Draft>({
  items,
  emptyMessage,
  renderItem,
  itemLabel,
  FormComponent,
  editor,
  onEdit,
  onDelete,
}: SectionItemsProps<T, Draft>) {
  const creationPanel =
    editor && editor.mode === "create"
      ? renderInlineEditor(
          itemLabel,
          FormComponent,
          editor,
          `${itemLabel}-create`
        )
      : null;

  const hasItems = items.length > 0;

  return (
    <div className="space-y-3">
      {creationPanel}
      {hasItems
        ? items.map((item) => {
            const rendered = renderItem(item);

            if (editor && isEditingTarget(editor, rendered.id)) {
              return renderInlineEditor(
                itemLabel,
                FormComponent,
                editor,
                rendered.id
              );
            }

            return (
              <ItemCard
                key={rendered.id}
                id={rendered.id}
                title={rendered.title}
                description={rendered.description}
                badge={rendered.badge}
                extra={rendered.extra}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })
        : !creationPanel && <EmptyState message={emptyMessage} />}
    </div>
  );
}
