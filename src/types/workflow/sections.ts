// Workflow section configuration types

export interface SectionDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedWords: number;
  required: boolean;
  prompt?: string;
  content?: string;
  order?: number;
}
