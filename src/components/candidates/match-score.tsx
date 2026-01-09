"use client";

import { cn } from "@/lib/utils";

interface MatchScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function MatchScore({ score, size = "md", showLabel = true }: MatchScoreProps) {
  const getColor = (score: number) => {
    if (score >= 80) return { stroke: "stroke-green-500", text: "text-green-600" };
    if (score >= 60) return { stroke: "stroke-yellow-500", text: "text-yellow-600" };
    return { stroke: "stroke-red-500", text: "text-red-600" };
  };

  const colors = getColor(score);

  const sizeClasses = {
    sm: { container: "w-12 h-12", text: "text-xs", label: "text-[10px]" },
    md: { container: "w-16 h-16", text: "text-sm", label: "text-xs" },
    lg: { container: "w-24 h-24", text: "text-lg", label: "text-sm" },
  };

  const strokeWidths = {
    sm: 4,
    md: 6,
    lg: 8,
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("relative", sizeClasses[size].container)}>
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidths[size]}
            className="text-muted/20"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={strokeWidths[size]}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(colors.stroke, "transition-all duration-500")}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", sizeClasses[size].text, colors.text)}>
            {score}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn("text-muted-foreground", sizeClasses[size].label)}>
          Match
        </span>
      )}
    </div>
  );
}
