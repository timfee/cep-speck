import { Edit3, Trash2 } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

interface ItemCardProps {
  id: string;
  title: string;
  description: string;
  badge: React.ReactNode;
  extra?: React.ReactNode;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ItemCard({
  id,
  title,
  description,
  badge,
  extra,
  onEdit,
  onDelete,
}: ItemCardProps) {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {badge}
          <h4 className="font-medium">{title}</h4>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={() => onEdit(id)}>
              <span className="sr-only">Edit {title}</span>
              <Edit3 aria-hidden="true" className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(id)}
              aria-label={`Delete ${title}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {extra}
    </div>
  );
}
