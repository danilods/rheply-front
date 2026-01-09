import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applications Chart Skeleton */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Skeleton className="mb-4 h-6 w-48" />
          <Skeleton className="h-[300px] w-full" />
        </div>

        {/* Source Distribution Skeleton */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Skeleton className="mb-4 h-6 w-44" />
          <Skeleton className="h-[300px] w-full" />
        </div>

        {/* Department Chart Skeleton */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="h-[300px] w-full" />
        </div>

        {/* Hiring Funnel Skeleton */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Skeleton className="mb-6 h-6 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
