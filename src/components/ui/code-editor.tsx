"use client";

import { useEffect, useRef, useState } from "react";

import { SPEC_TEMPLATES, type SpecTemplateKey } from "@/lib/spec-templates";
import { cn } from "@/lib/utils";

import { EditorHeader, StatusBar } from "./code-editor-parts";
import { TooltipProvider } from "./tooltip";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  copyButton?: boolean;
  className?: string;
  rows?: number;
  showWordCount?: boolean;
  maxWords?: number;
  showTemplates?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  placeholder = "Enter your specification...",
  title = "PRD Specification Input",
  copyButton = true,
  className,
  rows = 16,
  showWordCount = true,
  maxWords = 100,
  showTemplates = true,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  useEffect(() => {
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(value.length);
  }, [value]);

  const isOverLimit = Boolean(maxWords && wordCount > maxWords);

  const handleTemplateSelect = (templateKey: SpecTemplateKey) => {
    const template = SPEC_TEMPLATES[templateKey];
    onChange(template.content);
    setShowTemplateMenu(false);
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-3", className)}>
        {/* Header */}
        <EditorHeader
          title={title}
          showTemplates={showTemplates}
          copyButton={copyButton}
          value={value}
          showTemplateMenu={showTemplateMenu}
          onToggleTemplateMenu={() => setShowTemplateMenu(!showTemplateMenu)}
          onTemplateSelect={handleTemplateSelect}
        />

        {/* Editor */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={cn(
              "flex min-h-[320px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none",
              "syntax-highlighting",
              className
            )}
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
              lineHeight: "1.5",
            }}
          />
        </div>

        {/* Status Bar */}
        <StatusBar
          showWordCount={showWordCount}
          wordCount={wordCount}
          charCount={charCount}
          maxWords={maxWords}
          isOverLimit={isOverLimit}
        />
      </div>
    </TooltipProvider>
  );
}
