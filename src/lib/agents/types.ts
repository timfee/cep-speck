// Types for the new agentic system

export interface StructuredOutline {
  sections: OutlineSection[];
}

export interface OutlineSection {
  id: string;
  title: string;
  notes: string;
}

export interface EvaluationReport {
  issues: EvaluationIssue[];
}

export interface EvaluationIssue {
  section: string;
  issue: string;
  evidence: string;
  suggestion: string;
}

export type AgentPhase = "outline" | "draft" | "evaluate" | "refine";

export interface GenerateRequest {
  phase: AgentPhase;
  brief?: string;
  outline?: StructuredOutline;
  draft?: string;
  report?: EvaluationIssue[];
}
