import { Plus } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  onAdd: () => void;
  addLabel: string;
  disableAdd?: boolean;
}

export function SectionHeader({
  title,
  icon,
  onAdd,
  addLabel,
  disableAdd = false,
}: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        {icon}
        {title}
      </h3>
      <Button size="sm" variant="outline" onClick={onAdd} disabled={disableAdd}>
        <Plus className="mr-2 h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}
