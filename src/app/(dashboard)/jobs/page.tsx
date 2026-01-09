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
import { JobCard, type Job } from "@/components/jobs/job-card";
import { Plus, Search, LayoutGrid, List, Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock data for demonstration
const mockJobs: Job[] = [
  {
    id: "1",
    title: "Operador de Call Center",
    department: "Atendimento",
    location: "Sao Paulo, SP",
    postedDate: new Date("2024-03-10"),
    applicantsCount: 156,
    status: "open",
    employmentType: "Full-time",
    salaryRange: { min: 1800, max: 2500 },
  },
  {
    id: "2",
    title: "Assistente Administrativo",
    department: "Administrativo",
    location: "Rio de Janeiro, RJ",
    postedDate: new Date("2024-03-08"),
    applicantsCount: 89,
    status: "open",
    employmentType: "Full-time",
    salaryRange: { min: 2200, max: 3000 },
  },
  {
    id: "3",
    title: "Supervisor de Telemarketing",
    department: "Atendimento",
    location: "Belo Horizonte, MG",
    postedDate: new Date("2024-03-05"),
    applicantsCount: 42,
    status: "open",
    employmentType: "Full-time",
    salaryRange: { min: 3500, max: 4500 },
  },
  {
    id: "4",
    title: "Auxiliar de Escritorio",
    department: "Administrativo",
    location: "Curitiba, PR",
    postedDate: new Date("2024-03-12"),
    applicantsCount: 67,
    status: "open",
    employmentType: "Full-time",
    salaryRange: { min: 1600, max: 2000 },
  },
  {
    id: "5",
    title: "Recepcionista",
    department: "Administrativo",
    location: "Salvador, BA",
    postedDate: new Date("2024-03-01"),
    applicantsCount: 34,
    status: "closed",
    employmentType: "Full-time",
    salaryRange: { min: 1800, max: 2200 },
  },
  {
    id: "6",
    title: "Operador de SAC",
    department: "Atendimento",
    location: "Remoto",
    postedDate: new Date("2024-03-15"),
    applicantsCount: 203,
    status: "open",
    employmentType: "Full-time",
    salaryRange: { min: 1700, max: 2300 },
  },
  {
    id: "7",
    title: "Analista de RH Junior",
    department: "Recursos Humanos",
    location: "Porto Alegre, RS",
    postedDate: new Date("2024-03-14"),
    applicantsCount: 28,
    status: "open",
    employmentType: "Full-time",
    salaryRange: { min: 3000, max: 4000 },
  },
  {
    id: "8",
    title: "Atendente Comercial",
    department: "Comercial",
    location: "Fortaleza, CE",
    postedDate: new Date("2024-03-13"),
    applicantsCount: 95,
    status: "open",
    employmentType: "Full-time",
    salaryRange: { min: 1900, max: 2800 },
  },
  {
    id: "9",
    title: "Assistente Financeiro",
    department: "Financeiro",
    location: "Campinas, SP",
    postedDate: new Date("2024-03-11"),
    applicantsCount: 45,
    status: "draft",
    employmentType: "Full-time",
    salaryRange: { min: 2500, max: 3500 },
  },
  {
    id: "10",
    title: "Tecnico de Suporte",
    department: "TI",
    location: "Remoto",
    postedDate: new Date("2024-03-09"),
    applicantsCount: 78,
    status: "open",
    employmentType: "Full-time",
    salaryRange: { min: 2800, max: 4000 },
  },
];

const departments = [
  "Todos Departamentos",
  "Atendimento",
  "Administrativo",
  "Comercial",
  "Financeiro",
  "Recursos Humanos",
  "TI",
  "Operacoes",
];

const statuses = ["Todos Status", "Aberta", "Fechada", "Rascunho"];

const locations = [
  "Todas Localidades",
  "Remoto",
  "Sao Paulo, SP",
  "Rio de Janeiro, RJ",
  "Belo Horizonte, MG",
  "Curitiba, PR",
  "Porto Alegre, RS",
  "Salvador, BA",
  "Fortaleza, CE",
  "Campinas, SP",
];

// Mapeamento de status português para inglês
const statusMap: Record<string, string> = {
  "Aberta": "open",
  "Fechada": "closed",
  "Rascunho": "draft",
};

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos Status");
  const [departmentFilter, setDepartmentFilter] = useState("Todos Departamentos");
  const [locationFilter, setLocationFilter] = useState("Todas Localidades");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "Todos Status" ||
      job.status === statusMap[statusFilter];
    const matchesDepartment =
      departmentFilter === "Todos Departamentos" ||
      job.department === departmentFilter;
    const matchesLocation =
      locationFilter === "Todas Localidades" || job.location === locationFilter;

    return matchesSearch && matchesStatus && matchesDepartment && matchesLocation;
  });

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleView = (id: string) => {
    router.push(`/jobs/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/jobs/${id}/edit`);
  };

  const handleClose = (id: string) => {
    console.log("Closing job:", id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vagas</h1>
          <p className="text-muted-foreground">
            Gerencie suas vagas e acompanhe os candidatos
          </p>
        </div>
        <Link href="/jobs/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar Vaga
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar vagas..."
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
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
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
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={departmentFilter}
            onValueChange={(value) => {
              setDepartmentFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={locationFilter}
            onValueChange={(value) => {
              setLocationFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs Grid/List */}
      {paginatedJobs.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-4"
          }
        >
          {paginatedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onView={handleView}
              onEdit={handleEdit}
              onClose={handleClose}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma vaga encontrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery || statusFilter !== "Todos Status" || departmentFilter !== "Todos Departamentos"
              ? "Tente ajustar os filtros"
              : "Comece criando sua primeira vaga"}
          </p>
          {!searchQuery && statusFilter === "Todos Status" && departmentFilter === "Todos Departamentos" && (
            <Link href="/jobs/create" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Vaga
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
    </div>
  );
}
