"use client";

import { ChevronDown, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SPEC_TEMPLATES, type SpecTemplateKey } from "@/lib/spec-templates";
import { cn } from "@/lib/utils";

import { Badge } from "./badge";
import { Button } from "./button";
import { CopyButton } from "./copy-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

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

  const isOverLimit = maxWords && wordCount > maxWords;

  const handleTemplateSelect = (templateKey: SpecTemplateKey) => {
    const template = SPEC_TEMPLATES[templateKey];
    onChange(template.content);
    setShowTemplateMenu(false);
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-3", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Traffic light dots for polished UI */}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showTemplates && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                  className="h-8"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
                {showTemplateMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    {Object.entries(SPEC_TEMPLATES).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => handleTemplateSelect(key as SpecTemplateKey)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {copyButton && value && (
              <CopyButton 
                text={value} 
                className="h-8"
                onCopy={() => {
                  console.log("Spec copied to clipboard");
                }}
              />
            )}
          </div>
        </div>

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
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {showWordCount && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge 
                    variant={isOverLimit ? "destructive" : "secondary"} 
                    className="text-xs"
                  >
                    {wordCount} words
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {maxWords ? `${wordCount}/${maxWords} words` : `${wordCount} words`}
                    {isOverLimit && " (over limit)"}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            <span>{charCount} characters</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Markdown-like format</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}