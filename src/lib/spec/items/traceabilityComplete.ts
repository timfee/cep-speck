import type { Issue } from '../types';

export const itemId = 'traceability-complete';
export type Params = Record<string, never>;

function section(draft: string, rx: RegExp): string { 
  return draft.match(rx)?.[0] || ''; 
}

function bullets(block: string): string[] { 
  return block.split('\n')
    .map(l => l.trim())
    .filter(l => /^[-*]\s+/.test(l))
    .map(l => l.replace(/^[-*]\s+/, ''));
}

export function toPrompt(): string { 
  return 'Ensure every problem maps to a feature and every feature has at least one success metric.'; 
}

export function validate(draft: string): Issue[] {
  const issues: Issue[] = [];
  const problemBlock = section(draft, /# 2\. People Problems[\s\S]*?(?=# 3\.|$)/);
  const featureBlock = section(draft, /# 6\. Functional Requirements[\s\S]*?(?=# 7\.|$)/);
  const metricsBlock = section(draft, /# 8\. Success Metrics[\s\S]*?(?=# 9\.|$)/);

  const problems = bullets(problemBlock);
  // Rough feature segmentation by headings
  const featureSegments = featureBlock.split(/## F\d+ —/).slice(1); // discard preamble
  const features = featureSegments.map(s => s.split('\n')[0].trim());
  const metrics = bullets(metricsBlock);

  // Check that each problem is referenced by at least one feature
  for (const p of problems) {
    const ref = featureSegments.some(seg => seg.toLowerCase().includes(p.toLowerCase().slice(0, 30)));
    if (!ref) {
      issues.push({ 
        id: 'orphaned-problem', 
        itemId, 
        severity: 'error', 
        message: `Problem has no corresponding feature: "${p}"`, 
        evidence: p 
      });
    }
  }

  // Check that each feature has at least one success metric
  for (let i = 0; i < featureSegments.length; i++) {
    const name = features[i];
    const hasMetric = metrics.some(m => m.toLowerCase().includes(name.toLowerCase().split(' ')[0]));
    if (!hasMetric) {
      issues.push({ 
        id: 'unmeasured-feature', 
        itemId, 
        severity: 'error', 
        message: `Feature has no success metric: "${name}"`, 
        evidence: name 
      });
    }
  }

  return issues;
}

export function heal(): string | null { 
  return null; 
}