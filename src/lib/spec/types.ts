export type Severity = "error" | "warn";
export type ItemKind = "structure" | "style" | "linter" | "policy";

export interface Issue {
  id: string;
  itemId: string;
  severity: Severity;
  message: string;
  evidence?: string;
  hints?: string[];
}

export interface ValidationReport {
  ok: boolean;
  issues: Issue[];
  coverage?: Record<string, boolean>;
}

export interface SpecItemDef<P = unknown> {
  id: string;
  kind: ItemKind;
  summary?: string;
  params: P;
  priority: number;
  severity: Severity;
}

export interface HealPolicy {
  maxAttempts: number;
  order: "by-priority" | "by-severity-then-priority";
  groupBy: "item" | "theme";
  maxChars?: number;
  includeExamples?: boolean;
  style?: "bullets" | "numbered";
}

export interface CompositionSpec {
  sections?: { id: string; title: string; required?: boolean }[];
  labelPattern?: string;
  headerRegex?: string;
}

export interface SpecPack {
  id: string;
  description?: string;
  items: SpecItemDef[];
  healPolicy: HealPolicy;
  composition?: CompositionSpec;
  globals?: {
    bannedText?: { exact?: string[]; regex?: string[] };
    lexicon?: { preferred?: string[]; anti?: string[] };
  };
}

// Structured streaming protocol types
export type StreamPhase =
  | "loading-knowledge"
  | "performing-research"
  | "generating"
  | "validating"
  | "self-reviewing"
  | "healing"
  | "done"
  | "failed"
  | "error";

export type StreamFrame =
  | {
      type: "phase";
      data: {
        phase: StreamPhase;
        attempt: number;
        timestamp: number;
        message?: string;
      };
    }
  | {
      type: "generation";
      data: {
        delta: string;
        total: string;
        tokenCount?: number;
      };
    }
  | {
      type: "validation";
      data: {
        report: ValidationReport;
        duration?: number;
      };
    }
  | {
      type: "self-review";
      data: {
        confirmed: Issue[];
        filtered: Issue[];
        duration?: number;
      };
    }
  | {
      type: "healing";
      data: {
        instruction: string;
        issueCount: number;
        attempt: number;
      };
    }
  | {
      type: "result";
      data: {
        success: boolean;
        finalDraft: string;
        totalAttempts: number;
        totalDuration: number;
      };
    }
  | {
      type: "error";
      data: {
        message: string;
        recoverable: boolean;
        code?: string;
        details?: unknown;
      };
    };
