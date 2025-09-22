import { Wand2, Copy, AlertCircle, CheckCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStructuredWorkflowContext } from "@/contexts/structured-workflow-context";
import { getPhaseDescription } from "@/lib/streaming/stream-processor";

import { usePrdGeneration } from "../hooks/use-prd-generation";

const MAX_ISSUES_TO_DISPLAY = 5;

export function GenerateStep() {
  const { state, goToNextStep } = useStructuredWorkflowContext();
  const { 
    generatedPrd, 
    isGenerating, 
    phase, 
    progress, 
    attempt,
    validationIssues,
    error, 
    generatePrd 
  } = usePrdGeneration(goToNextStep);
  
  const handleGenerate = () => {
    generatePrd(state);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrd).catch((err) => {
      console.error('Failed to copy to clipboard:', err);
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Generate PRD</h2>
        <p className="text-muted-foreground">
          Transform your structured input into a complete PRD document using the hybrid AI workflow.
        </p>
      </div>
      
      {/* Generation Status */}
      {isGenerating && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Generation Progress</span>
              <span className="text-muted-foreground">
                {phase} {attempt > 0 && `(Attempt ${attempt})`}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {getPhaseDescription(phase)}
            </div>
          </div>
        </Card>
      )}
      
      {/* Validation Issues */}
      {validationIssues.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Validation Issues Detected:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationIssues.slice(0, MAX_ISSUES_TO_DISPLAY).map((issue, index) => (
                <li key={index} className="text-sm">
                  {issue.message}
                </li>
              ))}
              {validationIssues.length > MAX_ISSUES_TO_DISPLAY && (
                <li className="text-sm text-muted-foreground">
                  ...and {validationIssues.length - MAX_ISSUES_TO_DISPLAY} more issues
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Success Message */}
      {generatedPrd && !isGenerating && !error && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            PRD generation completed successfully! 
            {validationIssues.length === 0 && " All validation checks passed."}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Generate Button */}
      {!isGenerating && !generatedPrd && (
        <div className="flex justify-center">
          <Button onClick={handleGenerate} size="lg" className="min-w-[200px]">
            <Wand2 className="mr-2 h-4 w-4" />
            Generate PRD
          </Button>
        </div>
      )}
      
      {/* Regenerate Button */}
      {!isGenerating && generatedPrd && (
        <div className="flex justify-center">
          <Button onClick={handleGenerate} variant="outline" size="lg">
            <Wand2 className="mr-2 h-4 w-4" />
            Regenerate PRD
          </Button>
        </div>
      )}
      
      {/* Live Preview */}
      {generatedPrd && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Generated PRD</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {generatedPrd}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}
