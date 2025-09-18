import type { Issue } from '../types';

export const itemId = 'persona-coverage';
export type Params = { personas: string[] };

export function toPrompt(): string {
  return 'All personas must appear consistently in People Problems, Goals, and CUJs.';
}

export function validate(draft: string, params: Params): Issue[] {
  const issues: Issue[] = [];
  const defs = [
    { name: 'People Problems', rx: /# 2\. People Problems[\s\S]*?(?=# 3\.|$)/ },
    { name: 'Goals', rx: /# 4\. Goals[\s\S]*?(?=# 5\.|$)/ },
    { name: 'CUJs', rx: /# 5\. CUJs[\s\S]*?(?=# 6\.|$)/ }
  ];
  
  for (const persona of params.personas) {
    for (const def of defs) {
      const block = draft.match(def.rx)?.[0] || '';
      if (!block.toLowerCase().includes(persona.toLowerCase())) {
        issues.push({ 
          id: 'missing-persona-coverage', 
          itemId, 
          severity: 'error', 
          message: `Persona "${persona}" missing from ${def.name} section`, 
          evidence: persona 
        });
      }
    }
  }
  
  return issues;
}

export function heal(): string | null { 
  return null; 
}