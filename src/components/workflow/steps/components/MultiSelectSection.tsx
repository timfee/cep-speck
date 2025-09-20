"use client";

import { CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MultiSelectOption {
  readonly value: string;
  readonly label: string;
  readonly desc: string;
}

interface MultiSelectSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  selectedValues: string[];
  options: MultiSelectOption[];
  onToggle: (value: string) => void;
}

export function MultiSelectSection({
  title,
  icon: Icon,
  iconColor,
  selectedValues,
  options,
  onToggle,
}: MultiSelectSectionProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h3 className="text-lg font-semibold">{title}</h3>
        {selectedValues.length > 0 && (
          <Badge variant="outline">{selectedValues.length} selected</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <div
            key={option.value}
            className={cn(
              "border rounded-lg p-3 cursor-pointer transition-all",
              selectedValues.includes(option.value)
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-primary/50"
            )}
            onClick={() => onToggle(option.value)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">
                  {option.desc}
                </div>
              </div>
              {selectedValues.includes(option.value) && (
                <CheckCircle className="h-4 w-4 text-primary" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
