import type { Issue, SpecPack } from '../types';

export const itemId = 'metrics-required';

export type Params = {
  requireUnits?: boolean;
  requireTimeframe?: boolean;
  requireSourceOfTruth?: boolean;
  minMetrics?: number;
};

export function toPrompt(params: Params, pack?: SpecPack): string {
  const minMetrics = params.minMetrics || 3;
  let prompt = `Include at least ${minMetrics} specific, measurable success metrics. `;
  
  if (params.requireUnits) {
    prompt += 'Each metric must include specific units (%, seconds, users, etc.). ';
  }
  
  if (params.requireTimeframe) {
    prompt += 'Each metric must specify a timeframe for measurement. ';
  }
  
  if (params.requireSourceOfTruth) {
    prompt += 'Each metric must specify the source of truth for measurement. ';
  }
  
  return prompt + 'Make metrics SMART (Specific, Measurable, Achievable, Relevant, Time-bound).';
}

export async function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Promise<Issue[]> {
  const issues: Issue[] = [];
  const minMetrics = params.minMetrics || 3;
  
  // Find metrics section
  const metricsSection = draft.match(/#+\s*(?:success\s+)?metrics[\s\S]*?(?=\n#+|\n\n|\Z)/i);
  if (!metricsSection) {
    issues.push({
      id: `${itemId}-missing-section`,
      itemId,
      severity: 'error',
      message: 'Missing success metrics section',
      evidence: 'No metrics section found'
    });
    return issues;
  }
  
  const metricsText = metricsSection[0];
  
  // Extract individual metrics (look for list items or numbered items)
  const metricPatterns = [
    /^\s*[-*+]\s+(.+)$/gm,    // Bullet points
    /^\s*\d+\.\s+(.+)$/gm     // Numbered lists
  ];
  
  const metrics: string[] = [];
  metricPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(metricsText)) !== null) {
      metrics.push(match[1].trim());
    }
  });
  
  if (metrics.length < minMetrics) {
    issues.push({
      id: `${itemId}-insufficient-metrics`,
      itemId,
      severity: 'error',
      message: `Found only ${metrics.length} metrics, expected at least ${minMetrics}`,
      evidence: `Metrics: ${metrics.join('; ')}`
    });
  }
  
  // Check each metric for required elements
  metrics.forEach((metric, index) => {
    const metricId = `metric-${index + 1}`;
    
    if (params.requireUnits) {
      // Look for units: %, seconds, users, dollars, etc.
      const hasUnits = /\b(\d+(\.\d+)?)\s*(%|percent|seconds?|minutes?|hours?|days?|weeks?|months?|years?|users?|customers?|\$|USD|EUR|GBP|ms|kb|mb|gb|tb)\b/i.test(metric);
      if (!hasUnits) {
        issues.push({
          id: `${itemId}-missing-units-${metricId}`,
          itemId,
          severity: 'warn',
          message: `Metric "${metric.substring(0, 50)}..." missing specific units`,
          evidence: metric
        });
      }
    }
    
    if (params.requireTimeframe) {
      // Look for timeframe indicators
      const hasTimeframe = /\b(within|by|after|in|over|during|per|monthly|weekly|daily|quarterly|annually)\s+(\d+\s+)?(week|month|year|day|quarter|Q[1-4])\b/i.test(metric) ||
                          /\b(week|month|year|day|quarter|Q[1-4])\s+\d+\b/i.test(metric);
      if (!hasTimeframe) {
        issues.push({
          id: `${itemId}-missing-timeframe-${metricId}`,
          itemId,
          severity: 'warn',
          message: `Metric "${metric.substring(0, 50)}..." missing timeframe`,
          evidence: metric
        });
      }
    }
    
    if (params.requireSourceOfTruth) {
      // Look for source of truth indicators
      const hasSource = /\b(measured\s+by|tracked\s+in|via|using|from|source:|analytics|dashboard|system|tool|platform)\b/i.test(metric);
      if (!hasSource) {
        issues.push({
          id: `${itemId}-missing-source-${metricId}`,
          itemId,
          severity: 'warn',
          message: `Metric "${metric.substring(0, 50)}..." missing source of truth`,
          evidence: metric
        });
      }
    }
  });
  
  return issues;
}

export const itemModule = { itemId, toPrompt, validate };