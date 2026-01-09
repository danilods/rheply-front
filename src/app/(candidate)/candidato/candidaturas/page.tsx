"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCandidateStore, CandidateApplication } from "@/store/candidate";
import {
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Filter,
  FileText,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  enviada: {
    label: "Enviada",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    description: "Sua candidatura foi recebida e esta na fila de analise.",
  },
  em_analise: {
    label: "Em Analise",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    description: "O recrutador esta avaliando seu curriculo.",
  },
  entrevista: {
    label: "Entrevista",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    description: "Voce foi selecionado para uma entrevista.",
  },
  proposta: {
    label: "Proposta",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    description: "A empresa deseja fazer uma proposta para voce.",
  },
  rejeitada: {
    label: "Rejeitada",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    description: "Infelizmente nao foi desta vez.",
  },
  contratada: {
    label: "Contratada",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    description: "Parabens! Voce foi contratado!",
  },
};

export default function ApplicationsPage() {
  const { applications, setApplications } = useCandidateStore();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("todas");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setIsClient(true);

    // Initialize with demo data if empty
    if (applications.length === 0) {
      const demoApplications: CandidateApplication[] = [
        {
          id: "1",
          jobId: "job-1",
          jobTitle: "Desenvolvedor Full Stack Senior",
          company: "Tech Solutions",
          companyLogo: "",
          appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: "entrevista",
          matchScore: 92,
          timeline: [
            {
              id: "t1",
              title: "Candidatura Enviada",
              completedAt: new Date(
                Date.now() - 5 * 24 * 60 * 60 * 1000
              ).toISOString(),
              isCurrent: false,
            },
            {
              id: "t2",
              title: "Curriculo em Analise",
              completedAt: new Date(
                Date.now() - 3 * 24 * 60 * 60 * 1000
              ).toISOString(),
              isCurrent: false,
            },
            {
              id: "t3",
              title: "Selecionado para Entrevista",
              completedAt: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000
              ).toISOString(),
              isCurrent: true,
            },
            {
              id: "t4",
              title: "Avaliacao Final",
              isCurrent: false,
            },
            {
              id: "t5",
              title: "Decisao",
              isCurrent: false,
            },
          ],
          interviewDetails: {
            date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            time: "14:00",
            type: "video",
            meetingUrl: "https://meet.google.com/abc-def-ghi",
          },
          documents: ["curriculo.pdf", "portfolio.pdf"],
        },
        {
          id: "2",
          jobId: "job-2",
          jobTitle: "Frontend Developer",
          company: "StartupXYZ",
          companyLogo: "",
          appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "em_analise",
          matchScore: 85,
          timeline: [
            {
              id: "t1",
              title: "Candidatura Enviada",
              completedAt: new Date(
                Date.now() - 10 * 24 * 60 * 60 * 1000
              ).toISOString(),
              isCurrent: false,
            },
            {
              id: "t2",
              title: "Curriculo em Analise",
              completedAt: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
              ).toISOString(),
              isCurrent: true,
            },
            {
              id: "t3",
              title: "Selecionado para Entrevista",
              isCurrent: false,
            },
            {
              id: "t4",
              title: "Avaliacao Final",
              isCurrent: false,
            },
            {
              id: "t5",
              title: "Decisao",
              isCurrent: false,
            },
          ],
          documents: ["curriculo.pdf"],
        },
        {
          id: "3",
          jobId: "job-3",
          jobTitle: "Software Engineer",
          company: "Global Corp",
          companyLogo: "",
          appliedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "rejeitada",
          matchScore: 79,
          timeline: [
            {
              id: "t1",
              title: "Candidatura Enviada",
              completedAt: new Date(
                Date.now() - 15 * 24 * 60 * 60 * 1000
              ).toISOString(),
              isCurrent: false,
            },
            {
              id: "t2",
              title: "Curriculo em Analise",
              completedAt: new Date(
                Date.now() - 12 * 24 * 60 * 60 * 1000
              ).toISOString(),
              isCurrent: false,
            },
            {
              id: "t3",
              title: "Nao Selecionado",
              completedAt: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000
              ).toISOString(),
              isCurrent: true,
              description: "Perfil nao correspondeu aos requisitos",
            },
          ],
          documents: ["curriculo.pdf"],
          feedback:
            "Agradecemos seu interesse. Embora seu perfil seja forte em desenvolvimento frontend, buscamos alguem com mais experiencia em sistemas distribuidos e microsservicos. Sugerimos focar em projetos que envolvam arquiteturas escaláveis.",
        },
        {
          id: "4",
          jobId: "job-4",
          jobTitle: "React Developer",
          company: "Innovation Labs",
          companyLogo: "",
          appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: "enviada",
          matchScore: 88,
          timeline: [
            {
              id: "t1",
              title: "Candidatura Enviada",
              completedAt: new Date(
                Date.now() - 3 * 24 * 60 * 60 * 1000
              ).toISOString(),
              isCurrent: true,
            },
            {
              id: "t2",
              title: "Curriculo em Analise",
              isCurrent: false,
            },
            {
              id: "t3",
              title: "Selecionado para Entrevista",
              isCurrent: false,
            },
            {
              id: "t4",
              title: "Avaliacao Final",
              isCurrent: false,
            },
            {
              id: "t5",
              title: "Decisao",
              isCurrent: false,
            },
          ],
          documents: ["curriculo.pdf", "carta_apresentacao.pdf"],
        },
      ];
      setApplications(demoApplications);
    }
  }, [applications.length, setApplications]);

  const getFilteredApplications = () => {
    let filtered = applications;

    // Filter by tab
    if (activeTab === "ativas") {
      filtered = filtered.filter(
        (app) => !["rejeitada", "contratada"].includes(app.status)
      );
    } else if (activeTab === "finalizadas") {
      filtered = filtered.filter((app) =>
        ["rejeitada", "contratada"].includes(app.status)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    return filtered.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  const filteredApplications = getFilteredApplications();

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Candidaturas</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o status de todas as suas candidaturas em um so lugar.
          </p>
        </div>
        <Link href="/vagas">
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Buscar Vagas
          </Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Voce ainda nao se candidatou
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Comece sua busca agora! Encontre vagas que combinam com seu perfil e
              candidate-se com um clique.
            </p>
            <Link href="/vagas">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Buscar Vagas
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="todas">
                  Todas ({applications.length})
                </TabsTrigger>
                <TabsTrigger value="ativas">
                  Ativas (
                  {
                    applications.filter(
                      (a) => !["rejeitada", "contratada"].includes(a.status)
                    ).length
                  }
                  )
                </TabsTrigger>
                <TabsTrigger value="finalizadas">
                  Finalizadas (
                  {
                    applications.filter((a) =>
                      ["rejeitada", "contratada"].includes(a.status)
                    ).length
                  }
                  )
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="enviada">Enviada</SelectItem>
                    <SelectItem value="em_analise">Em Analise</SelectItem>
                    <SelectItem value="entrevista">Entrevista</SelectItem>
                    <SelectItem value="proposta">Proposta</SelectItem>
                    <SelectItem value="rejeitada">Rejeitada</SelectItem>
                    <SelectItem value="contratada">Contratada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <Card
                    key={app.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{app.jobTitle}</h3>
                            <Badge
                              className={cn(
                                "font-medium",
                                statusConfig[app.status].color
                              )}
                            >
                              {statusConfig[app.status].label}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{app.company}</p>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Candidatura:{" "}
                              {format(new Date(app.appliedAt), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Atualizado{" "}
                              {formatDistanceToNow(new Date(app.updatedAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              Match: {app.matchScore}%
                            </span>
                          </div>

                          {app.status === "entrevista" && app.interviewDetails && (
                            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                              <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                                Entrevista agendada para{" "}
                                {format(
                                  new Date(app.interviewDetails.date),
                                  "dd/MM/yyyy",
                                  { locale: ptBR }
                                )}{" "}
                                as {app.interviewDetails.time}
                              </p>
                            </div>
                          )}

                          {app.status === "rejeitada" && app.feedback && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium mb-1">
                                Feedback da empresa:
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {app.feedback}
                              </p>
                            </div>
                          )}
                        </div>

                        <Button variant="outline" asChild>
                          <Link href={`/candidato/candidaturas/${app.id}`}>
                            Ver Detalhes
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredApplications.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">
                        Nenhuma candidatura encontrada com os filtros selecionados.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Status Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Legenda de Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <div key={key} className="flex items-start gap-3">
                    <Badge className={cn("mt-0.5", config.color)}>
                      {config.label}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
