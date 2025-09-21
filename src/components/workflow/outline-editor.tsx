import React from "react";

import { Button } from "@/components/ui/button";
import type { StructuredOutline } from "@/lib/agents/types";

interface OutlineEditorProps {
  outline: StructuredOutline;
  onChange: (outline: StructuredOutline) => void;
  isLoading: boolean;
}

export function OutlineEditor({
  outline,
  onChange,
  isLoading,
}: OutlineEditorProps) {
  const updateSection = (
    index: number,
    field: "title" | "notes",
    value: string
  ) => {
    const newSections = [...outline.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    onChange({ sections: newSections });
  };

  const addSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: "New Section",
      notes: "",
    };
    onChange({ sections: [...outline.sections, newSection] });
  };

  const removeSection = (index: number) => {
    const newSections = outline.sections.filter((_, i) => i !== index);
    onChange({ sections: newSections });
  };

  return (
    <div className="space-y-3">
      {outline.sections.map((section, index) => (
        <div key={section.id} className="border border-gray-200 rounded-md p-3">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={section.title}
              onChange={(e) => updateSection(index, "title", e.target.value)}
              className="flex-1 font-medium border-none outline-none"
              disabled={isLoading}
            />
            <button
              onClick={() => removeSection(index)}
              className="text-red-500 hover:text-red-700 text-sm"
              disabled={isLoading}
            >
              Remove
            </button>
          </div>
          <textarea
            value={section.notes}
            onChange={(e) => updateSection(index, "notes", e.target.value)}
            placeholder="Add notes or specific requirements for this section..."
            className="w-full h-16 p-2 text-sm border border-gray-200 rounded"
            disabled={isLoading}
          />
        </div>
      ))}
      <Button
        onClick={addSection}
        variant="outline"
        size="sm"
        disabled={isLoading}
      >
        Add Section
      </Button>
    </div>
  );
}
