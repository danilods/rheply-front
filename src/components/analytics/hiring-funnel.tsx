"use client";

import { cn } from "@/lib/utils";

interface FunnelStage {
  name: string;
  count: number;
  color: string;
}

interface HiringFunnelProps {
  data: FunnelStage[];
  className?: string;
}

export function HiringFunnel({ data, className }: HiringFunnelProps) {
  const maxCount = data[0]?.count || 1;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 shadow-sm",
        className
      )}
    >
      <h3 className="mb-6 text-lg font-semibold">Hiring Funnel</h3>
      <div className="space-y-3">
        {data.map((stage, index) => {
          const percentage = ((stage.count / maxCount) * 100).toFixed(1);
          const conversionRate =
            index > 0
              ? ((stage.count / data[index - 1].count) * 100).toFixed(1)
              : "100";

          return (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stage.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {stage.count} candidates
                  </span>
                  {index > 0 && (
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                      {conversionRate}% conversion
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-10 w-full overflow-hidden rounded-md bg-muted">
                <div
                  className="absolute inset-y-0 left-0 flex items-center justify-center rounded-md transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: stage.color,
                    minWidth: "60px",
                  }}
                >
                  <span className="text-sm font-semibold text-white">
                    {percentage}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
