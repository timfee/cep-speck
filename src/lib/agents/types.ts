export interface OutlineSection {
  id: string;
  title: string;
  notes?: string;
}

export interface StructuredOutline {
  sections: OutlineSection[];
}

export interface EvaluationIssue {
  section: string;
  issue: string;
  evidence?: string;
  suggestion?: string;
}

export type EvaluationReport = EvaluationIssue[];

export type AgentPhase = "outline" | "draft" | "evaluate" | "refine";
