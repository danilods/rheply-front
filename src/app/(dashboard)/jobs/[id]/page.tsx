"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Pencil,
  MapPin,
  Briefcase,
  Users,
  TrendingUp,
  Eye,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

// Mock job data
const mockJobData = {
  id: "1",
  title: "Operador de Call Center Senior",
  department: "Atendimento",
  location: "Remoto",
  employmentType: "CLT",
  status: "open" as const,
  postedDate: new Date("2024-03-10"),
  salaryRange: { min: 2500, max: 3500 },
  applicantsCount: 45,
  viewsCount: 1234,
  description: `
    <p>Estamos procurando um Operador de Call Center Senior para liderar nossa equipe de atendimento. Voce sera responsavel por garantir a qualidade do atendimento e treinar novos colaboradores.</p>

    <h3>O que voce fara:</h3>
    <ul>
      <li>Atender clientes via telefone e chat</li>
      <li>Supervisionar equipe de atendentes</li>
      <li>Monitorar metricas de qualidade e tempo de atendimento</li>
      <li>Treinar novos colaboradores</li>
      <li>Elaborar relatorios de desempenho</li>
    </ul>

    <h3>Ferramentas utilizadas:</h3>
    <ul>
      <li>Sistema de CRM</li>
      <li>Plataforma de telefonia IP</li>
      <li>Pacote Office</li>
      <li>WhatsApp Business</li>
    </ul>
  `,
  requirements: [
    "2+ anos de experiencia em call center",
    "Experiencia em lideranca de equipes",
    "Conhecimento em sistemas de CRM",
    "Excelente comunicacao verbal e escrita",
    "Facilidade com tecnologia",
    "Ensino medio completo (superior sera diferencial)",
  ],
  skills: ["Atendimento ao Cliente", "CRM", "Lideranca", "Excel", "Comunicacao"],
  benefits: [
    "Salario competitivo + bonificacoes",
    "Trabalho remoto ou hibrido",
    "Vale refeicao e transporte",
    "Plano de saude e odontologico",
    "Seguro de vida",
    "Treinamento continuo",
  ],
};

const statusColors = {
  open: "success",
  closed: "destructive",
  draft: "secondary",
} as const;

const statusLabels = {
  open: "Aberta",
  closed: "Fechada",
  draft: "Rascunho",
};

interface Applicant {
  id: string;
  name: string;
  email: string;
  appliedDate: Date;
  status: string;
  matchScore: number;
}

const mockApplicants: Applicant[] = [
  {
    id: "1",
    name: "Maria Silva Santos",
    email: "maria.silva@email.com",
    appliedDate: new Date("2024-03-11"),
    status: "Em Triagem",
    matchScore: 92,
  },
  {
    id: "2",
    name: "Joao Pedro Oliveira",
    email: "joao.oliveira@email.com",
    appliedDate: new Date("2024-03-12"),
    status: "Entrevista Agendada",
    matchScore: 88,
  },
  {
    id: "3",
    name: "Ana Carolina Souza",
    email: "ana.souza@email.com",
    appliedDate: new Date("2024-03-13"),
    status: "Novo",
    matchScore: 75,
  },
];

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const job = mockJobData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Vagas
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
              <Badge variant={statusColors[job.status]}>
                {statusLabels[job.status]}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {job.department}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Posted {format(job.postedDate, "MMM d, yyyy")}
              </span>
            </div>
          </div>
          <Link href={`/jobs/${params.id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Editar Vaga
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{job.applicantsCount}</p>
              <p className="text-sm text-muted-foreground">Total de Candidatos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{job.viewsCount}</p>
              <p className="text-sm text-muted-foreground">Visualizacoes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {((job.applicantsCount / job.viewsCount) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Taxa de Conversao</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visao Geral</TabsTrigger>
          <TabsTrigger value="applicants">
            Candidatos ({job.applicantsCount})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Descricao da Vaga</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requisitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Beneficios</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Vaga</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Tipo de Contrato
                    </span>
                    <span className="text-sm font-medium">
                      {job.employmentType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Localizacao</span>
                    <span className="text-sm font-medium">{job.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Faixa Salarial
                    </span>
                    <span className="text-sm font-medium">
                      R$ {job.salaryRange.min.toLocaleString()} - R$ {job.salaryRange.max.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Departamento
                    </span>
                    <span className="text-sm font-medium">{job.department}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Habilidades Requeridas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applicants">
          <Card>
            <CardHeader>
              <CardTitle>Candidatos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockApplicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{applicant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {applicant.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Candidatou-se em {format(applicant.appliedDate, "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {applicant.matchScore}% Compatibilidade
                        </p>
                        <Badge variant="outline">{applicant.status}</Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Painel de Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Graficos e metricas serao exibidos aqui
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
