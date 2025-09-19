"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusProps {
  status: "valid" | "invalid" | "warning" | "checking";
  message: string;
  className?: string;
}

export function Status({ status, message, className }: StatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "valid":
        return {
          icon: CheckCircle,
          variant: "default" as const,
          color: "text-green-600",
        };
      case "invalid":
        return {
          icon: XCircle,
          variant: "destructive" as const,
          color: "text-red-600",
        };
      case "warning":
        return {
          icon: AlertCircle,
          variant: "secondary" as const,
          color: "text-yellow-600",
        };
      case "checking":
        return {
          icon: Clock,
          variant: "outline" as const,
          color: "text-blue-600",
        };
    }
  };

  const { icon: Icon, variant, color } = getStatusConfig();

  return (
    <Badge variant={variant} className={cn("flex items-center gap-2", className)}>
      <Icon className={cn("h-4 w-4", color)} />
      {message}
    </Badge>
  );
}