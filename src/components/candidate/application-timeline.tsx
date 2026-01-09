"use client";

import { ApplicationTimelineStep } from "@/store/candidate";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ApplicationTimelineProps {
  steps: ApplicationTimelineStep[];
  className?: string;
  orientation?: "vertical" | "horizontal";
}

export function ApplicationTimeline({
  steps,
  className,
  orientation = "vertical",
}: ApplicationTimelineProps) {
  const getStepIcon = (step: ApplicationTimelineStep) => {
    if (step.completedAt) {
      return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    }
    if (step.isCurrent) {
      return <Clock className="h-6 w-6 text-blue-500 animate-pulse" />;
    }
    return <Circle className="h-6 w-6 text-muted-foreground" />;
  };

  if (orientation === "horizontal") {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-500"
            style={{
              width: `${
                (steps.filter((s) => s.completedAt).length / (steps.length - 1)) * 100
              }%`,
            }}
          />

          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center relative z-10",
                index === 0 && "items-start",
                index === steps.length - 1 && "items-end"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 transition-colors",
                  step.completedAt && "border-green-500",
                  step.isCurrent && "border-blue-500",
                  !step.completedAt && !step.isCurrent && "border-muted"
                )}
              >
                {getStepIcon(step)}
              </div>
              <div
                className={cn(
                  "mt-2 text-center max-w-[120px]",
                  index === 0 && "text-left",
                  index === steps.length - 1 && "text-right"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.isCurrent && "text-blue-600",
                    step.completedAt && "text-green-600",
                    !step.completedAt && !step.isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
                {step.completedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(step.completedAt), "dd/MM", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vertical orientation (default)
  return (
    <div className={cn("relative", className)}>
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-muted" />

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.id} className="relative flex gap-4">
            {/* Icon with background */}
            <div
              className={cn(
                "relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 transition-colors flex-shrink-0",
                step.completedAt && "border-green-500",
                step.isCurrent && "border-blue-500",
                !step.completedAt && !step.isCurrent && "border-muted"
              )}
            >
              {getStepIcon(step)}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between">
                <h4
                  className={cn(
                    "font-medium",
                    step.isCurrent && "text-blue-600",
                    step.completedAt && "text-green-600",
                    !step.completedAt && !step.isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </h4>
                {step.completedAt && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(step.completedAt), "dd MMM yyyy, HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                )}
              </div>
              {step.description && (
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              )}
              {step.isCurrent && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  <Clock className="h-3 w-3" />
                  Etapa atual
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
