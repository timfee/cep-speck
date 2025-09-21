"use client";

import type { LucideIcon } from "lucide-react";
import React from "react";

import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RadioOption {
  readonly value: string;
  readonly label: string;
  readonly desc: string;
}

interface RadioGroupSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  columns?: number;
}

const GRID_COLUMNS = {
  TWO: 2,
  THREE: 3,
} as const;

export function RadioGroupSection({
  title,
  icon: Icon,
  iconColor,
  value,
  options,
  onChange,
  columns = GRID_COLUMNS.TWO,
}: RadioGroupSectionProps) {
  const gridClass =
    columns === GRID_COLUMNS.THREE ? "grid-cols-3" : "grid-cols-2";

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        className={`grid gap-4 ${gridClass}`}
      >
        {options.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-2 border rounded-lg p-3"
          >
            <RadioGroupItem value={option.value} id={option.value} />
            <label htmlFor={option.value} className="flex-1 cursor-pointer">
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.desc}</div>
            </label>
          </div>
        ))}
      </RadioGroup>
    </Card>
  );
}
