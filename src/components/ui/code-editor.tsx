"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Badge } from "./badge";

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
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(value.length);
  }, [value]);

  const isOverLimit = maxWords && wordCount > maxWords;

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
          {copyButton && value && (
            <CopyButton 
              text={value} 
              className="h-8"
              onCopy={() => {
                // Could add toast notification here
                console.log("Spec copied to clipboard");
              }}
            />
          )}
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