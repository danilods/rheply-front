"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateCard, type Candidate } from "@/components/candidates/candidate-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, LayoutGrid, Columns, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock data for demonstration
const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Maria Silva Santos",
    email: "maria.silva@gmail.com",
    phone: "(11) 98765-4321",
    currentPosition: "Operadora de Telemarketing",
    skills: ["Atendimento ao Cliente", "Vendas", "Pacote Office", "CRM"],
    matchScore: 92,
    status: "interviewed",
    source: "WhatsApp",
    appliedDate: new Date("2024-03-10"),
  },
  {
    id: "2",
    name: "Joao Pedro Oliveira",
    email: "joao.oliveira@hotmail.com",
    phone: "(21) 97654-3210",
    currentPosition: "Assistente Administrativo",
    skills: ["Excel Avancado", "Organizacao", "Digitacao", "Arquivo"],
    matchScore: 88,
    status: "screened",
    source: "Indicacao",
    appliedDate: new Date("2024-03-12"),
  },
  {
    id: "3",
    name: "Ana Carolina Souza",
    email: "ana.souza@yahoo.com.br",
    currentPosition: "Recepcionista",
    skills: ["Atendimento", "Telefonia", "Agenda", "Organizacao"],
    matchScore: 75,
    status: "new",
    source: "Portal de Vagas",
    appliedDate: new Date("2024-03-14"),
  },
  {
    id: "4",
    name: "Carlos Eduardo Lima",
    email: "carlos.lima@gmail.com",
    phone: "(31) 96543-2109",
    currentPosition: "Operador de Call Center",
    skills: ["SAC", "Vendas", "Negociacao", "Sistema Interno"],
    matchScore: 85,
    status: "offered",
    source: "Site da Empresa",
    appliedDate: new Date("2024-03-08"),
  },
  {
    id: "5",
    name: "Fernanda Costa Pereira",
    email: "fernanda.costa@outlook.com",
    currentPosition: "Auxiliar de Escritorio",
    skills: ["Word", "Excel", "Digitacao Rapida", "Arquivo"],
    matchScore: 68,
    status: "new",
    source: "WhatsApp",
    appliedDate: new Date("2024-03-15"),
  },
  {
    id: "6",
    name: "Rafael Almeida Nunes",
    email: "rafael.nunes@gmail.com",
    phone: "(41) 95432-1098",
    currentPosition: "Supervisor de Atendimento",
    skills: ["Lideranca", "Gestao de Equipe", "KPIs", "Treinamento"],
    matchScore: 55,
    status: "rejected",
    source: "Indicacao",
    appliedDate: new Date("2024-03-05"),
  },
  {
    id: "7",
    name: "Juliana Ferreira Gomes",
    email: "juliana.gomes@hotmail.com",
    currentPosition: "Atendente Comercial",
    skills: ["Vendas", "Atendimento", "Prospecao", "CRM"],
    matchScore: 72,
    status: "screened",
    source: "Portal de Vagas",
    appliedDate: new Date("2024-03-11"),
  },
  {
    id: "8",
    name: "Lucas Martins Rocha",
    email: "lucas.rocha@gmail.com",
    currentPosition: "Analista de Suporte",
    skills: ["Help Desk", "Windows", "Redes", "Atendimento Tecnico"],
    matchScore: 90,
    status: "hired",
    source: "LinkedIn",
    appliedDate: new Date("2024-02-28"),
  },
  {
    id: "9",
    name: "Patricia Ribeiro Castro",
    email: "patricia.castro@yahoo.com",
    phone: "(51) 94321-0987",
    currentPosition: "Auxiliar Financeiro",
    skills: ["Contas a Pagar", "Excel", "Conciliacao", "Organizacao"],
    matchScore: 82,
    status: "interviewed",
    source: "Site da Empresa",
    appliedDate: new Date("2024-03-09"),
  },
  {
    id: "10",
    name: "Bruno Henrique Dias",
    email: "bruno.dias@gmail.com",
    currentPosition: "Operador de Cobranca",
    skills: ["Negociacao", "Cobranca", "Sistema", "Comunicacao"],
    matchScore: 78,
    status: "new",
    source: "WhatsApp",
    appliedDate: new Date("2024-03-13"),
  },
];

const statusOptions = [
  "Todos Status",
  "Novo",
  "Triagem",
  "Entrevistado",
  "Proposta",
  "Contratado",
  "Rejeitado",
];

const sourceOptions = [
  "Todas Origens",
  "WhatsApp",
  "Indicacao",
  "Portal de Vagas",
  "Site da Empresa",
  "LinkedIn",
];

const skillOptions = [
  "Todas Habilidades",
  "Atendimento ao Cliente",
  "Excel",
  "Vendas",
  "Digitacao",
  "CRM",
  "Pacote Office",
];

const kanbanColumns = [
  { key: "new", label: "Novo", color: "bg-blue-500" },
  { key: "screened", label: "Triagem", color: "bg-yellow-500" },
  { key: "interviewed", label: "Entrevistado", color: "bg-purple-500" },
  { key: "offered", label: "Proposta", color: "bg-green-500" },
  { key: "hired", label: "Contratado", color: "bg-emerald-500" },
];

// Mapeamento de status português para inglês (para compatibilidade com dados)
const statusMap: Record<string, string> = {
  "Novo": "new",
  "Triagem": "screened",
  "Entrevistado": "interviewed",
  "Proposta": "offered",
  "Contratado": "hired",
  "Rejeitado": "rejected",
};

export default function CandidatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos Status");
  const [sourceFilter, setSourceFilter] = useState("Todas Origens");
  const [skillFilter, setSkillFilter] = useState("Todas Habilidades");
  const [viewMode, setViewMode] = useState<"grid" | "kanban">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredCandidates = mockCandidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "Todos Status" ||
      candidate.status === statusMap[statusFilter];
    const matchesSource =
      sourceFilter === "Todas Origens" || candidate.source === sourceFilter;
    const matchesSkill =
      skillFilter === "Todas Habilidades" || candidate.skills.includes(skillFilter);

    return matchesSearch && matchesStatus && matchesSource && matchesSkill;
  });

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleView = (id: string) => {
    router.push(`/candidates/${id}`);
  };

  const handleContact = (id: string) => {
    console.log("Contact candidate:", id);
  };

  const handleSchedule = (id: string) => {
    console.log("Schedule interview:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Delete candidate:", id);
  };

  const getCandidatesByStatus = (status: string) => {
    return filteredCandidates.filter((c) => c.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidatos</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe seu pipeline de candidatos
          </p>
        </div>
        <Link href="/candidates/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Candidato
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("kanban")}
            >
              <Columns className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sourceFilter}
            onValueChange={(value) => {
              setSourceFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={skillFilter}
            onValueChange={(value) => {
              setSkillFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Skill" />
            </SelectTrigger>
            <SelectContent>
              {skillOptions.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Candidates View */}
      {viewMode === "grid" ? (
        <>
          {paginatedCandidates.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onView={handleView}
                  onContact={handleContact}
                  onSchedule={handleSchedule}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum candidato encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "Todos Status" || sourceFilter !== "Todas Origens"
                  ? "Tente ajustar os filtros"
                  : "Comece adicionando seu primeiro candidato"}
              </p>
              {!searchQuery && statusFilter === "Todos Status" && sourceFilter === "Todas Origens" && (
                <Link href="/candidates/add" className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Candidato
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-9"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Proximo
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-4 md:grid-cols-5">
          {kanbanColumns.map((column) => {
            const columnCandidates = getCandidatesByStatus(column.key);
            return (
              <Card key={column.key} className="min-w-[280px]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${column.color}`}
                        />
                        {column.label}
                      </div>
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {columnCandidates.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {columnCandidates.length > 0 ? (
                    columnCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {candidate.currentPosition}
                            </p>
                          </div>
                          <Badge
                            variant={
                              candidate.matchScore >= 80
                                ? "success"
                                : candidate.matchScore >= 60
                                ? "warning"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {candidate.matchScore}%
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 2).map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => handleView(candidate.id)}
                        >
                          Ver Perfil
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      Sem candidatos
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
