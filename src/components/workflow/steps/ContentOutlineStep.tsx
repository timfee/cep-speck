"use client";

import {
  ArrowDown,
  ArrowUp,
  FileText,
  GripVertical,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { StructuredOutline } from "@/lib/agents";
import type { EditableOutlineSection } from "@/types/workflow";

const BRIEF_PREVIEW_LIMIT = 140;

interface ContentOutlineStepProps {
  brief: string;
  outline: StructuredOutline | null;
  onRegenerateOutline: () => void;
  onUpdateSection: (
    id: string,
    updates: Partial<EditableOutlineSection>
  ) => void;
  onAddSection: () => void;
  onRemoveSection: (id: string) => void;
  onMoveSection: (fromIndex: number, toIndex: number) => void;
  isLoading?: boolean;
}

export function ContentOutlineStep({
  brief,
  outline,
  onRegenerateOutline,
  onUpdateSection,
  onAddSection,
  onRemoveSection,
  onMoveSection,
  isLoading = false,
}: ContentOutlineStepProps) {
  const sections = outline?.sections ?? [];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Review & Edit Outline</h2>
        <p className="text-muted-foreground">
          Fine-tune the structure before drafting. Update section titles, add
          context notes, or adjust the order to match your narrative.
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-semibold">Generated Outline</span>
            <Badge variant="outline">{sections.length} sections</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerateOutline}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Regenerate
            </Button>
            <Button
              size="sm"
              onClick={onAddSection}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
          <strong>Brief:</strong> &ldquo;{brief.slice(0, BRIEF_PREVIEW_LIMIT)}
          {brief.length > BRIEF_PREVIEW_LIMIT ? "…" : ""}&rdquo;
        </div>
      </Card>

      {sections.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground border-dashed">
          <p className="flex flex-col items-center gap-3">
            <GripVertical className="h-8 w-8 text-muted-foreground/60" />
            No sections yet. Generate or add a section to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <Card
              key={section.id}
              className="p-4 space-y-4 border border-primary/10"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  Section {index + 1}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMoveSection(index, Math.max(0, index - 1))}
                    disabled={index === 0 || isLoading}
                    aria-label="Move section up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      onMoveSection(
                        index,
                        Math.min(sections.length - 1, index + 1)
                      )
                    }
                    disabled={index === sections.length - 1 || isLoading}
                    aria-label="Move section down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveSection(section.id)}
                    disabled={isLoading}
                    aria-label="Remove section"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Section Title
                </label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(event) =>
                    onUpdateSection(section.id, { title: event.target.value })
                  }
                  disabled={isLoading}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  placeholder="e.g., Executive Summary"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Notes for the drafter
                </label>
                <Textarea
                  value={section.notes ?? ""}
                  onChange={(event) =>
                    onUpdateSection(section.id, { notes: event.target.value })
                  }
                  disabled={isLoading}
                  rows={4}
                  placeholder="Add key bullets, context, or links for this section..."
                />
                <p className="text-xs text-muted-foreground">
                  These notes are passed directly to the drafting agent to steer
                  the content for this section.
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
