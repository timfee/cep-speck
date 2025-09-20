import React from "react";

import { Card } from "@/components/ui/card";

import {
  EmptyState,
  ItemCard,
  SectionHeader,
} from "./ContentSectionComponents";

interface ContentSectionProps<T> {
  title: string;
  icon: React.ReactNode;
  items: T[];
  onAdd: () => void;
  emptyMessage: string;
  renderItem: (item: T) => {
    id: string;
    title: string;
    description: string;
    badge: React.ReactNode;
    extra?: React.ReactNode;
  };
}

export function ContentSection<T>({
  title,
  icon,
  items,
  onAdd,
  emptyMessage,
  renderItem,
}: ContentSectionProps<T>) {
  return (
    <Card className="p-4">
      <SectionHeader title={title} icon={icon} onAdd={onAdd} />
      <div className="space-y-3">
        {items.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          items.map((item) => {
            const rendered = renderItem(item);
            return (
              <ItemCard
                key={rendered.id}
                id={rendered.id}
                title={rendered.title}
                description={rendered.description}
                badge={rendered.badge}
                extra={rendered.extra}
              />
            );
          })
        )}
      </div>
    </Card>
  );
}
