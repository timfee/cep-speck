import type { Issue } from '../types';

export const itemId = 'traceability-complete';
export type Params = Record<string, never>;

// Configuration constants for matching algorithms
const PROBLEM_SUBSTRING_LENGTH = 30;

function section(draft: string, rx: RegExp): string { 
  return draft.match(rx)?.[0] || ''; 
}

function bullets(block: string): string[] { 
  return block.split('\n')
    .map(l => l.trim())
    .filter(l => /^[-*]\s+/.test(l))
    .map(l => l.replace(/^[-*]\s+/, ''));
}

/**
 * Extract meaningful keywords from a feature name for better matching
 */
function extractFeatureKeywords(featureName: string): string[] {
  // Remove common words and extract meaningful terms
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  return featureName
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 3); // Take up to 3 most significant words
}

/**
 * Check if a metric references a feature using multiple matching strategies
 */
function doesMetricReferenceFeature(metric: string, featureName: string): boolean {
  const metricLower = metric.toLowerCase();
  const featureKeywords = extractFeatureKeywords(featureName);
  
  // Strategy 1: Check if any significant keyword from feature name appears in metric
  const keywordMatch = featureKeywords.some(keyword => metricLower.includes(keyword));
  
  // Strategy 2: Check if first word of feature name appears (original logic as fallback)
  const firstWordMatch = metricLower.includes(featureName.toLowerCase().split(' ')[0]);
  
  return keywordMatch || firstWordMatch;
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
    const ref = featureSegments.some(seg => 
      seg.toLowerCase().includes(p.toLowerCase().slice(0, PROBLEM_SUBSTRING_LENGTH))
    );
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
    const hasMetric = metrics.some(m => doesMetricReferenceFeature(m, name));
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