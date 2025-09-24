import React from "react";

import { Card } from "@/components/ui/card";

import { type FormComponentProps } from "./inline-editor-panel";
import { SectionHeader } from "./section-header";
import { SectionItems } from "./section-items";

interface ContentSectionProps<T, Draft> {
  title: string;
  icon: React.ReactNode;
  items: T[];
  onAdd: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  emptyMessage: string;
  renderItem: (item: T) => {
    id: string;
    title: string;
    description: string;
    badge: React.ReactNode;
    extra?: React.ReactNode;
  };
  addLabel: string;
  itemLabel: string;
  FormComponent: React.ComponentType<FormComponentProps<Draft>>;
  editor?: FormComponentProps<Draft>;
}

export function ContentSection<T, Draft>({
  title,
  icon,
  items,
  onAdd,
  onEdit,
  onDelete,
  emptyMessage,
  renderItem,
  addLabel,
  itemLabel,
  FormComponent,
  editor,
}: ContentSectionProps<T, Draft>) {
  return (
    <Card className="p-4">
      <SectionHeader
        title={title}
        icon={icon}
        onAdd={onAdd}
        addLabel={addLabel}
        disableAdd={Boolean(editor)}
      />
      <SectionItems
        items={items}
        emptyMessage={emptyMessage}
        renderItem={renderItem}
        itemLabel={itemLabel}
        FormComponent={FormComponent}
        editor={editor}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </Card>
  );
}
