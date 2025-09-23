/**
 * Code editor configuration and utility functions
 */
import { SPEC_TEMPLATES, type SpecTemplateKey } from "@/lib/spec-templates";

/**
 * Default editor configuration
 */
export const EDITOR_DEFAULTS = {
  placeholder: "Enter your specification...",
  title: "PRD Specification Input",
  copyButton: true,
  rows: 16,
  showWordCount: true,
  maxWords: 100,
  showTemplates: true,
} as const;

/**
 * Calculate word and character counts from text
 */
export function calculateTextMetrics(value: string) {
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const chars = value.length;

  return { wordCount: words, charCount: chars };
}

/**
 * Check if word count exceeds limit
 */
export function isWordCountOver(wordCount: number, maxWords?: number): boolean {
  return Boolean(maxWords && wordCount > maxWords);
}

/**
 * Handle template selection
 */
export function createTemplateHandler(
  onChange: (value: string) => void,
  onMenuToggle: () => void
) {
  return (templateKey: SpecTemplateKey) => {
    const template = SPEC_TEMPLATES[templateKey];
    onChange(template.content);
    onMenuToggle(); // Close menu
  };
}

/**
 * Create editor style configuration
 */
export function getEditorStyles() {
  return {
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
    lineHeight: "1.5",
  } as const;
}
