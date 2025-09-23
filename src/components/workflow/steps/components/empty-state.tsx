import React from "react";

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="py-8 text-center text-muted-foreground">{message}</div>
  );
}
