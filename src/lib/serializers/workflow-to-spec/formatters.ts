import type {
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
} from "@/types/workflow";

import { METRIC_SUMMARY_LIMIT, SUMMARY_SEPARATOR } from "./constants";

export function formatList(items: string[], emptyValue: string): string {
  if (items.length === 0) return emptyValue;
  return items.join(", ");
}

export function formatTerm(term: string): string {
  return term
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function summarizeMetrics(metrics: SuccessMetric[]): string[] {
  return metrics.slice(0, METRIC_SUMMARY_LIMIT).map((metric) => {
    const parts = [metric.name];
    if (typeof metric.target === "string" && metric.target.trim().length > 0) {
      parts.push(`Target: ${metric.target}`);
    }
    if (
      typeof metric.measurement === "string" &&
      metric.measurement.trim().length > 0
    ) {
      parts.push(`Measurement: ${metric.measurement}`);
    }
    return parts.join(SUMMARY_SEPARATOR);
  });
}

export function formatFunctionalRequirement(
  req: FunctionalRequirement
): string {
  const lines: string[] = [];
  lines.push(`- [${req.priority}] ${req.title}: ${req.description}`);
  if (typeof req.userStory === "string" && req.userStory.trim().length > 0) {
    lines.push(`  • User Story: ${req.userStory}`);
  }
  if (
    Array.isArray(req.acceptanceCriteria) &&
    req.acceptanceCriteria.length > 0
  ) {
    lines.push(`  • Acceptance Criteria: ${req.acceptanceCriteria.join("; ")}`);
  }
  if (Array.isArray(req.dependencies) && req.dependencies.length > 0) {
    lines.push(
      `  • Dependencies: ${req.dependencies.map(formatTerm).join(", ")}`
    );
  }
  if (
    typeof req.estimatedEffort === "string" &&
    req.estimatedEffort.trim().length > 0
  ) {
    lines.push(`  • Estimated Effort: ${req.estimatedEffort}`);
  }
  return lines.join("\n");
}

export function formatSuccessMetric(metric: SuccessMetric): string {
  const segments: string[] = [];
  segments.push(`- ${metric.name}: ${metric.description}`);
  if (typeof metric.target === "string" && metric.target.trim().length > 0) {
    segments.push(`  • Target: ${metric.target}`);
  }
  if (
    typeof metric.measurement === "string" &&
    metric.measurement.trim().length > 0
  ) {
    segments.push(`  • Measurement: ${metric.measurement}`);
  }
  if (
    typeof metric.frequency === "string" &&
    metric.frequency.trim().length > 0
  ) {
    segments.push(`  • Reporting Cadence: ${metric.frequency}`);
  }
  if (typeof metric.owner === "string" && metric.owner.trim().length > 0) {
    segments.push(`  • Owner: ${metric.owner}`);
  }
  return segments.join("\n");
}

export function formatMilestone(milestone: Milestone): string {
  const parts = [milestone.title];
  parts.push(`Phase: ${formatTerm(milestone.phase)}`);
  if (
    typeof milestone.estimatedDate === "string" &&
    milestone.estimatedDate.trim().length > 0
  ) {
    parts.push(`ETA: ${milestone.estimatedDate}`);
  }
  parts.push(milestone.description);
  return parts.join(SUMMARY_SEPARATOR);
}
