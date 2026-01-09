"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { AutomationBuilder } from "@/components/automations/automation-builder";

function BuilderContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const mode = editId ? "edit" : "create";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/automacoes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "create" ? "Criar Automacao" : "Editar Automacao"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Configure um novo workflow automatizado"
              : "Modifique as configuracoes da automacao"}
          </p>
        </div>
      </div>

      {/* Builder */}
      <AutomationBuilder automationId={editId || undefined} mode={mode} />
    </div>
  );
}

function BuilderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export default function CriarAutomacaoPage() {
  return (
    <Suspense fallback={<BuilderSkeleton />}>
      <BuilderContent />
    </Suspense>
  );
}
