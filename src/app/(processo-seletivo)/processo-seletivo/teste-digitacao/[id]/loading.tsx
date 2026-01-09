import { Loader2, Keyboard } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Keyboard className="h-12 w-12 text-teal-500 animate-pulse" />
          </div>
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
            <span className="ml-3 text-lg text-muted-foreground">
              Preparando teste de digitação...
            </span>
          </div>

          {/* Skeleton for stats */}
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>

          {/* Skeleton for text area */}
          <Skeleton className="h-32 w-full rounded-lg" />

          {/* Skeleton for input */}
          <Skeleton className="h-24 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
