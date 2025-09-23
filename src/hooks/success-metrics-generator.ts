/**
 * Success metrics generation
 */

import type { SuccessMetric } from "@/types/workflow";

import {
  includesAnalyticsKeywords,
  includesCollaborationKeywords,
  includesEnterpriseKeywords,
  includesIntegrationKeywords,
} from "./requirement-keywords";

/**
 * Create user adoption metric
 */
export function createAdoptionMetric(): SuccessMetric {
  return {
    id: "sm-user-adoption",
    name: "User Adoption Rate",
    description: "Percentage of target users actively using the product",
    type: "adoption" as const,
    target: "75% within 3 months",
    measurement: "Monthly active users / Total registered users",
    frequency: "Monthly",
  };
}

/**
 * Create engagement metric
 */
export function createEngagementMetric(): SuccessMetric {
  return {
    id: "sm-user-engagement",
    name: "User Engagement",
    description: "Frequency and depth of user interactions",
    type: "engagement" as const,
    target: "80% daily active users",
    measurement: "Daily active users / Monthly active users",
    frequency: "Daily",
  };
}

/**
 * Create performance metric
 */
export function createPerformanceMetric(): SuccessMetric {
  return {
    id: "sm-performance",
    name: "System Performance",
    description: "Response time and system reliability metrics",
    type: "performance" as const,
    target: "< 200ms response time, 99.9% uptime",
    measurement: "Average API response time and system availability",
    frequency: "Real-time",
  };
}

/**
 * Create business impact metric
 */
export function createBusinessImpactMetric(): SuccessMetric {
  return {
    id: "sm-business-impact",
    name: "Business Impact",
    description: "Measurable business value and ROI from product adoption",
    type: "business" as const,
    target: "15% productivity improvement",
    measurement: "Time saved per user per week",
    frequency: "Quarterly",
  };
}

/**
 * Generate success metrics based on prompt analysis
 */
export function generateSuccessMetrics(prompt: string): SuccessMetric[] {
  const lowercasePrompt = prompt.toLowerCase();
  const metrics: SuccessMetric[] = [];

  // Core metrics (always included)
  metrics.push(createAdoptionMetric());
  metrics.push(createEngagementMetric());

  // Performance metrics for enterprise or integration features
  if (
    includesEnterpriseKeywords(lowercasePrompt) ||
    includesIntegrationKeywords(lowercasePrompt)
  ) {
    metrics.push(createPerformanceMetric());
  }

  // Business impact metrics for analytics or collaboration features
  if (
    includesAnalyticsKeywords(lowercasePrompt) ||
    includesCollaborationKeywords(lowercasePrompt)
  ) {
    metrics.push(createBusinessImpactMetric());
  }

  return metrics;
}
