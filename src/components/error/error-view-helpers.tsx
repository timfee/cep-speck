/**
 * Error view rendering utilities
 */
import React from "react";

/**
 * Render a formatted code block
 */
export function CodeBlock({ 
  title, 
  content, 
  className = "" 
}: { 
  title: string; 
  content: string; 
  className?: string; 
}) {
  return (
    <>
      <div>
        <strong>{title}:</strong>
      </div>
      <pre className={`mt-2 p-3 bg-muted rounded text-xs overflow-auto whitespace-pre-wrap ${className}`}>
        {content}
      </pre>
    </>
  );
}

/**
 * Render technical context as JSON
 */
export function TechnicalContext({ context }: { context: Record<string, unknown> }) {
  return (
    <CodeBlock 
      title="Context" 
      content={JSON.stringify(context, null, 2)} 
    />
  );
}

/**
 * Render stack trace if available
 */
export function StackTrace({ stack }: { stack?: string }) {
  if (!stack || stack.length === 0) return null;

  return (
    <CodeBlock 
      title="Stack Trace" 
      content={stack} 
    />
  );
}

/**
 * Render reproduction steps list
 */
export function ReproductionSteps({ steps }: { steps: string[] }) {
  return (
    <div>
      <strong>Reproduction Steps:</strong>
      <ol className="mt-1 ml-4 list-decimal space-y-1">
        {steps.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ol>
    </div>
  );
}