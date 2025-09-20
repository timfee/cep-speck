import { Edit3, Plus } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  onAdd: () => void;
}

export function SectionHeader({ title, icon, onAdd }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <Button size="sm" variant="outline" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Add {title.split(" ")[0]}
      </Button>
    </div>
  );
}

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">{message}</div>
  );
}

interface ItemCardProps {
  id: string;
  title: string;
  description: string;
  badge: React.ReactNode;
  extra?: React.ReactNode;
}

export function ItemCard({ title, description, badge, extra }: ItemCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {badge}
          <h4 className="font-medium">{title}</h4>
        </div>
        <Button size="sm" variant="ghost">
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {extra}
    </div>
  );
}
