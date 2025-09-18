export type Severity = 'error' | 'warn';
export type ItemKind = 'structure' | 'style' | 'linter' | 'policy';

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
  order: 'by-priority' | 'by-severity-then-priority';
  groupBy: 'item' | 'theme';
  maxChars?: number;
  includeExamples?: boolean;
  style?: 'bullets' | 'numbered';
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
