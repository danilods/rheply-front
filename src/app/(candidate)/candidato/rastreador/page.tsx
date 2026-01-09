"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KanbanBoard } from "@/components/candidate/kanban-board";
import { useCandidateStore, TrackedJob } from "@/store/candidate";
import { Lightbulb, Target, TrendingUp } from "lucide-react";

export default function JobTrackerPage() {
  const {
    trackedJobs,
    addTrackedJob,
    updateTrackedJob,
    deleteTrackedJob,
    moveTrackedJob,
  } = useCandidateStore();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Initialize with demo data if empty
    if (trackedJobs.length === 0) {
      const demoJobs: TrackedJob[] = [
        {
          id: "track-1",
          title: "Senior React Developer",
          company: "Meta",
          url: "https://linkedin.com/jobs/...",
          source: "LinkedIn",
          dateAdded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Vaga muito interessante, salario competitivo",
          salary: "R$ 25.000 - 35.000",
          location: "Remoto",
          column: "interessado",
        },
        {
          id: "track-2",
          title: "Full Stack Engineer",
          company: "Nubank",
          url: "https://gupy.io/...",
          source: "Gupy",
          dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Cultura incrivel, preciso preparar portfolio",
          salary: "R$ 18.000 - 24.000",
          location: "Sao Paulo, SP",
          column: "interessado",
        },
        {
          id: "track-3",
          title: "Software Developer",
          company: "iFood",
          url: "https://carreiras.ifood.com.br/...",
          source: "Site da Empresa",
          dateAdded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Aplicado via site oficial",
          salary: "R$ 15.000 - 20.000",
          location: "Remoto",
          column: "aplicado",
        },
        {
          id: "track-4",
          title: "Frontend Lead",
          company: "PicPay",
          url: "https://linkedin.com/jobs/...",
          source: "LinkedIn",
          dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Entrevista tecnica marcada para proxima semana",
          salary: "R$ 22.000 - 28.000",
          location: "Hibrido - Sao Paulo",
          column: "entrevista",
        },
        {
          id: "track-5",
          title: "React Native Developer",
          company: "Startup ABC",
          url: "https://indeed.com/...",
          source: "Indeed",
          dateAdded: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Sem resposta apos 2 semanas",
          salary: "R$ 12.000 - 16.000",
          location: "Remoto",
          column: "rejeitado",
        },
      ];

      demoJobs.forEach((job) => addTrackedJob(job));
    }
  }, [trackedJobs.length, addTrackedJob]);

  const getStats = () => {
    const stats = {
      total: trackedJobs.length,
      interessado: trackedJobs.filter((j) => j.column === "interessado").length,
      aplicado: trackedJobs.filter((j) => j.column === "aplicado").length,
      entrevista: trackedJobs.filter((j) => j.column === "entrevista").length,
      proposta: trackedJobs.filter((j) => j.column === "proposta").length,
      rejeitado: trackedJobs.filter((j) => j.column === "rejeitado").length,
    };
    return stats;
  };

  const stats = getStats();

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Rastreador de Vagas</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe todas as suas oportunidades em um so lugar, de qualquer fonte.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Interessado</p>
            <p className="text-2xl font-bold text-slate-600">{stats.interessado}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Aplicado</p>
            <p className="text-2xl font-bold text-blue-600">{stats.aplicado}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Entrevista</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.entrevista}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Proposta</p>
            <p className="text-2xl font-bold text-green-600">{stats.proposta}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Rejeitado</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejeitado}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">
                Dica: Centralize sua busca de emprego
              </p>
              <p className="text-sm text-muted-foreground">
                Use este rastreador para acompanhar vagas de LinkedIn, Gupy, Indeed,
                sites de empresas e qualquer outra fonte. Arraste os cartoes entre as
                colunas para atualizar o status de cada oportunidade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <KanbanBoard
        jobs={trackedJobs}
        onAddJob={addTrackedJob}
        onUpdateJob={updateTrackedJob}
        onDeleteJob={deleteTrackedJob}
        onMoveJob={moveTrackedJob}
      />

      {/* Insights */}
      {trackedJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Taxa de Conversao
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Interessado para Aplicado
                  </span>
                  <span className="font-medium">
                    {stats.interessado > 0
                      ? Math.round(
                          ((stats.aplicado +
                            stats.entrevista +
                            stats.proposta +
                            stats.rejeitado) /
                            stats.total) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Aplicado para Entrevista
                  </span>
                  <span className="font-medium">
                    {stats.aplicado + stats.entrevista + stats.proposta > 0
                      ? Math.round(
                          ((stats.entrevista + stats.proposta) /
                            (stats.aplicado +
                              stats.entrevista +
                              stats.proposta +
                              stats.rejeitado)) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Entrevista para Proposta
                  </span>
                  <span className="font-medium">
                    {stats.entrevista + stats.proposta > 0
                      ? Math.round(
                          (stats.proposta / (stats.entrevista + stats.proposta)) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Fontes Mais Efetivas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  trackedJobs.reduce((acc, job) => {
                    acc[job.source] = (acc[job.source] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([source, count]) => (
                    <div key={source} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{source}</span>
                      <span className="font-medium">{count} vagas</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
