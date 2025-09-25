// Core types for the modular validation system

export interface Issue {
  id: string;
  itemId: string;
  severity: "error" | "warn";
  message: string;
  evidence?: string;
  location?: {
    section?: string;
    line?: number;
    column?: number;
  };
}

export interface SpecPack {
  id: string;
  items: SpecItem[];
  composition?: {
    labelPattern?: string;
    headerRegex?: string;
    sectionCount?: number;
  };
  globals?: {
    bannedText?: {
      exact?: string[];
      regex?: string[];
      itemRefs?: string[];
    };
    lexicon?: Record<string, string>;
    targetWordCount?: number;
  };
}

export interface SpecItem {
  id: string;
  kind: "structure" | "style" | "linter" | "policy";
  priority: number; // 0-100
  severity: "error" | "warn";
  params: Record<string, any>;
}

// Validation module interface
export interface ValidationModule {
  itemId: string;
  toPrompt: (params: any, pack?: SpecPack) => string;
  validate: (draft: string, params: any, pack?: SpecPack) => Promise<Issue[]>;
}

// StreamFrame types for the streaming protocol
export type StreamFrame = 
  | PhaseFrame
  | GenerationFrame  
  | ValidationFrame
  | SelfReviewFrame
  | HealingFrame
  | ResultFrame
  | ErrorFrame;

export interface PhaseFrame {
  type: "phase";
  phase: "input" | "rag" | "thinking" | "generation" | "validation" | "healing";
  attempt: number;
  message: string;
  timestamp?: Date;
}

export interface GenerationFrame {
  type: "generation";
  content: string;
  partial: boolean;
  section?: string;
}

export interface ValidationFrame {
  type: "validation";
  issues: Issue[];
  passed: boolean;
}

export interface SelfReviewFrame {
  type: "self-review";
  feedback: string;
  score: number; // 0-100
  suggestions?: string[];
}

export interface HealingFrame {
  type: "healing";
  instructions: string;
  changes: Array<{
    section: string;
    change: string;
    reason: string;
  }>;
}

export interface ResultFrame {
  type: "result";
  success: boolean;
  data?: any;
  issues?: Issue[];
  attempts?: number;
}

export interface ErrorFrame {
  type: "error";
  message: string;
  recoverable: boolean;
  code?: string;
}

// Utility functions
export function createPhaseFrame(phase: PhaseFrame["phase"], attempt: number, message: string): PhaseFrame {
  return {
    type: "phase",
    phase,
    attempt,
    message,
    timestamp: new Date()
  };
}

export function createGenerationFrame(content: string, partial: boolean, section?: string): GenerationFrame {
  return {
    type: "generation",
    content,
    partial,
    section
  };
}

export function createValidationFrame(issues: Issue[]): ValidationFrame {
  return {
    type: "validation",
    issues,
    passed: issues.filter(i => i.severity === "error").length === 0
  };
}

export function createErrorFrame(message: string, recoverable: boolean = true, code?: string): ErrorFrame {
  return {
    type: "error",
    message,
    recoverable,
    code
  };
}

export function createResultFrame(success: boolean, data?: any, issues?: Issue[], attempts?: number): ResultFrame {
  return {
    type: "result",
    success,
    data,
    issues,
    attempts
  };
}

export function encodeStreamFrame(frame: StreamFrame): string {
  return JSON.stringify(frame) + '\n';
}