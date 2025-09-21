interface ValidationFeedbackProps {
  issues: string[];
  suggestedSections: string[];
  spec: string;
  onSpecChange: (newSpec: string) => void;
}

/**
 * Component for displaying validation feedback and suggestions
 */
export function ValidationFeedback({
  issues,
  suggestedSections,
  spec,
  onSpecChange,
}: ValidationFeedbackProps) {
  if (issues.length === 0 && suggestedSections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Real-time validation feedback */}
      {issues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Input Suggestions:
          </h4>
          <div className="space-y-1">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className="text-xs text-muted-foreground flex items-center gap-2"
              >
                <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                {issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested sections */}
      {suggestedSections.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Suggested additions:
          </h4>
          <div className="space-y-1">
            {suggestedSections.map((suggestion, idx) => (
              <div
                key={idx}
                className="text-xs text-blue-600 cursor-pointer hover:text-blue-800"
                onClick={() => {
                  const newSpec = spec.trim() + "\n" + suggestion;
                  onSpecChange(newSpec);
                }}
              >
                + {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
