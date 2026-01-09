"use client";

import { cn } from "@/lib/utils";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface SourceData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface SourceDistributionProps {
  data: SourceData[];
  className?: string;
}

export function SourceDistribution({
  data,
  className,
}: SourceDistributionProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 shadow-sm",
        className
      )}
    >
      <h3 className="mb-4 text-lg font-semibold">Candidates by Source</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value, name) => [
                typeof value === 'number' ? `${value} (${((value / total) * 100).toFixed(1)}%)` : "0",
                name ?? "",
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
