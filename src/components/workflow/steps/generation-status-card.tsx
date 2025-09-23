import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export interface GenerationStatusCardProps {
  isGenerating: boolean;
  phase: string;
  attempt: number;
  progress: number;
  phaseDescription: string;
}

export function GenerationStatusCard({
  isGenerating,
  phase,
  attempt,
  progress,
  phaseDescription,
}: GenerationStatusCardProps) {
  if (!isGenerating) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Generation Progress</span>
          <span className="text-muted-foreground">
            {phase} {attempt > 0 && `(Attempt ${attempt})`}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="text-xs text-muted-foreground">{phaseDescription}</div>
      </div>
    </Card>
  );
}
