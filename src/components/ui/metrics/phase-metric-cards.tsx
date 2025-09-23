import { MetricCard } from "./metric-card";
import { METRIC_CONFIGS } from "./metric-configs";

interface PhaseMetric {
  key: string;
  label: string;
  attempts: number;
  issues: number;
  message?: string;
}

interface PhaseMetricCardsProps {
  phases: PhaseMetric[];
}

export function PhaseMetricCards({ phases }: PhaseMetricCardsProps) {
  return (
    <>
      {phases.map((entry) => (
        <MetricCard
          key={entry.key}
          icon={METRIC_CONFIGS.iterationAttempts.icon}
          label={entry.label}
          value={`Attempt ${Math.max(entry.attempts, 1)}`}
          sublabel={
            entry.issues > 0
              ? `${entry.issues} issue${entry.issues === 1 ? "" : "s"}`
              : (entry.message ?? "No issues detected")
          }
          colorClass={METRIC_CONFIGS.iterationAttempts.colorClass}
        />
      ))}
    </>
  );
}
