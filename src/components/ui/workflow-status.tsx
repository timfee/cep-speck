"use client";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, AlertCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface WorkflowStatusProps {
  phase: string;
  attempt?: number;
  streaming?: boolean;
  className?: string;
  showAttempt?: boolean;
}

// Comprehensive phase configuration
const PHASE_CONFIG = {
  'starting': {
    status: 'maintenance' as const,
    spinner: 'ring' as const,
    color: 'blue',
    bgColor: 'bg-blue-50 border-blue-200 text-blue-700',
    label: 'Initializing',
    description: 'Setting up PRD generation',
    icon: Loader2
  },
  'generating': {
    status: 'maintenance' as const,
    spinner: 'infinite' as const,
    color: 'blue',
    bgColor: 'bg-blue-50 border-blue-200 text-blue-700',
    label: 'Generating Content',
    description: 'AI is creating your PRD document',
    icon: Loader2
  },
  'validating': {
    status: 'degraded' as const,
    spinner: 'ellipsis' as const,
    color: 'amber',
    bgColor: 'bg-amber-50 border-amber-200 text-amber-700',
    label: 'Validating Output',
    description: 'Checking against validation rules',
    icon: Clock
  },
  'healing': {
    status: 'degraded' as const,
    spinner: 'bars' as const,
    color: 'amber',
    bgColor: 'bg-amber-50 border-amber-200 text-amber-700',
    label: 'Self-Healing',
    description: 'Correcting identified issues',
    icon: AlertCircle
  },
  'done': {
    status: 'online' as const,
    spinner: null,
    color: 'green',
    bgColor: 'bg-green-50 border-green-200 text-green-700',
    label: 'Generation Complete',
    description: 'PRD successfully generated and validated',
    icon: CheckCircle
  },
  'error': {
    status: 'offline' as const,
    spinner: null,
    color: 'red',
    bgColor: 'bg-red-50 border-red-200 text-red-700',
    label: 'Generation Failed',
    description: 'An error occurred during generation',
    icon: XCircle
  },
  '': {
    status: 'offline' as const,
    spinner: null,
    color: 'gray',
    bgColor: 'bg-gray-50 border-gray-200 text-gray-700',
    label: 'Ready',
    description: 'Ready to start PRD generation',
    icon: Clock
  }
} as const;

export function WorkflowStatus({ 
  phase, 
  attempt = 0, 
  streaming = false, 
  className,
  showAttempt = true 
}: WorkflowStatusProps) {
  const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG[''];
  const { spinner, bgColor, label, description, icon: Icon } = config;

  return (
    <motion.div
      className={cn("space-y-3", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main Status Badge */}
      <motion.div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-300",
          bgColor
        )}
        layout
        animate={{ scale: streaming && config.spinner ? [1, 1.02, 1] : 1 }}
        transition={{ duration: 2, repeat: streaming && config.spinner ? Infinity : 0 }}
        role="status"
        aria-live="polite"
        aria-label={`PRD generation ${phase}, ${description}`}
      >
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {streaming && spinner ? (
            <Spinner 
              variant={spinner} 
              size={20} 
              className="text-current"
            />
          ) : (
            <Icon className="h-5 w-5" />
          )}
          
          <div className="flex flex-col">
            <span className="font-medium text-base">
              {label}
            </span>
            <span className="text-xs opacity-75">
              {description}
            </span>
          </div>
        </div>

        {/* Attempt Counter */}
        {showAttempt && attempt > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto"
          >
            <Badge variant="outline" className="text-xs px-2 py-1">
              Attempt {attempt}
            </Badge>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Progress Timeline Component
export interface ProgressTimelineProps {
  currentPhase: string;
  attempt: number;
  maxAttempts?: number;
  className?: string;
}

const TIMELINE_PHASES = ['starting', 'generating', 'validating', 'healing', 'done'];

export function ProgressTimeline({ 
  currentPhase, 
  attempt, 
  maxAttempts = 3, 
  className 
}: ProgressTimelineProps) {
  const currentIndex = TIMELINE_PHASES.indexOf(currentPhase);
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Phase Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Progress</span>
        <span className="text-xs text-muted-foreground">
          {attempt}/{maxAttempts} attempts
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        {TIMELINE_PHASES.map((phase, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];
          
          return (
            <div key={phase} className="flex items-center">
              <motion.div
                className={cn(
                  "w-3 h-3 rounded-full border-2 transition-all duration-300",
                  isCompleted
                    ? "bg-green-500 border-green-500"
                    : isActive
                    ? `border-${config.color}-500 bg-${config.color}-100`
                    : "border-gray-300 bg-white"
                )}
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
              />
              {index < TIMELINE_PHASES.length - 1 && (
                <div className={cn(
                  "w-6 h-0.5 mx-1 transition-colors duration-300",
                  index < currentIndex ? "bg-green-500" : "bg-gray-300"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}