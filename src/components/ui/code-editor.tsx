"use client";

import { useEffect, useRef, useState } from "react";

import type { SpecTemplateKey } from "@/lib/spec-templates";
import { cn } from "@/lib/utils";

import { 
  EDITOR_DEFAULTS,
  calculateTextMetrics,
  isWordCountOver,
  createTemplateHandler,
  getEditorStyles
} from "./code-editor-config";
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
  placeholder = EDITOR_DEFAULTS.placeholder,
  title = EDITOR_DEFAULTS.title,
  copyButton = EDITOR_DEFAULTS.copyButton,
  className,
  rows = EDITOR_DEFAULTS.rows,
  showWordCount = EDITOR_DEFAULTS.showWordCount,
  maxWords = EDITOR_DEFAULTS.maxWords,
  showTemplates = EDITOR_DEFAULTS.showTemplates,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [{ wordCount, charCount }, setTextMetrics] = useState({ wordCount: 0, charCount: 0 });
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  useEffect(() => {
    setTextMetrics(calculateTextMetrics(value));
  }, [value]);

  const isOverLimit = isWordCountOver(wordCount, maxWords);
  const handleTemplateSelect = createTemplateHandler(onChange, () => setShowTemplateMenu(false));

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
            style={getEditorStyles()}
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
