import { ChevronDown, FileText } from "lucide-react";

import { SPEC_TEMPLATES } from "@/lib/spec-templates";
import type { SpecTemplateKey } from "@/lib/spec-templates";

import { Badge } from "./badge";
import { Button } from "./button";
import { CopyButton } from "./copy-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface EditorHeaderProps {
  title: string;
  showTemplates: boolean;
  copyButton: boolean;
  value: string;
  showTemplateMenu: boolean;
  onToggleTemplateMenu: () => void;
  onTemplateSelect: (key: SpecTemplateKey) => void;
}

export function EditorHeader({
  title,
  showTemplates,
  copyButton,
  value,
  showTemplateMenu,
  onToggleTemplateMenu,
  onTemplateSelect,
}: EditorHeaderProps) {
  return (
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
          <TemplateSelector
            showMenu={showTemplateMenu}
            onToggleMenu={onToggleTemplateMenu}
            onTemplateSelect={onTemplateSelect}
          />
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
  );
}

interface TemplateSelectorProps {
  showMenu: boolean;
  onToggleMenu: () => void;
  onTemplateSelect: (key: SpecTemplateKey) => void;
}

function TemplateSelector({
  showMenu,
  onToggleMenu,
  onTemplateSelect,
}: TemplateSelectorProps) {
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleMenu}
        className="h-8"
      >
        <FileText className="h-4 w-4 mr-2" />
        Templates
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          {Object.entries(SPEC_TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => onTemplateSelect(key as SpecTemplateKey)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
            >
              {template.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface StatusBarProps {
  showWordCount: boolean;
  wordCount: number;
  charCount: number;
  maxWords?: number;
  isOverLimit: boolean;
}

export function StatusBar({
  showWordCount,
  wordCount,
  charCount,
  maxWords,
  isOverLimit,
}: StatusBarProps) {
  return (
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
                {maxWords
                  ? `${wordCount}/${maxWords} words`
                  : `${wordCount} words`}
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
  );
}
