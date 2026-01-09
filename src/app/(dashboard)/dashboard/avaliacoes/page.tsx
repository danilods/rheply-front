"use client";

/**
 * Evaluation List Page - Dashboard for monitoring all evaluations.
 *
 * Features:
 * - List of all evaluations with filters
 * - Status badges and score display
 * - Links to evaluation details
 * - Auto-refresh capability
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search,
  RefreshCw,
  Eye,
  ClipboardCheck,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  FileDown,
  Filter,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

// Types
interface Evaluation {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  evaluation_type: string;
  status: EvaluationStatus;
  score: number | null;
  max_score: number;
  passed: boolean | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  attempts: number;
  process_id: string | null;
  process_name: string | null;
}

type EvaluationStatus = "pending" | "in_progress" | "completed" | "expired" | "cancelled";
type EvaluationType = "typing_test" | "knowledge_test" | "behavioral_test" | "technical_test";

interface PaginatedResponse {
  items: Evaluation[];
  total: number;
  page: number;
  pages: number;
}

// Status configuration
const STATUS_CONFIG: Record<EvaluationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pendente",
    color: "bg-slate-800 text-slate-300 border-slate-700",
    icon: <Clock className="h-3 w-3" />,
  },
  in_progress: {
    label: "Em Andamento",
    color: "bg-blue-900/50 text-blue-400 border-blue-800",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  completed: {
    label: "Concluido",
    color: "bg-teal-900/50 text-teal-400 border-teal-800",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  expired: {
    label: "Expirado",
    color: "bg-orange-900/50 text-orange-400 border-orange-800",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-900/50 text-red-400 border-red-800",
    icon: <XCircle className="h-3 w-3" />,
  },
};

const EVALUATION_TYPE_LABELS: Record<EvaluationType, string> = {
  typing_test: "Teste de Digitacao",
  knowledge_test: "Teste de Conhecimento",
  behavioral_test: "Teste Comportamental",
  technical_test: "Teste Tecnico",
};

export default function AvaliacoesPage() {
  const router = useRouter();
  const { token, _hasHydrated, logout } = useAuthStore();

  // State
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const pageSize = 20;

  // Reset modal state
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetReason, setResetReason] = useState("");
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  // Load evaluations
  const loadEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
      });

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (typeFilter && typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      // Try to fetch from API - use dashboard endpoint for candidate data
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        console.log("[Avaliacoes List] Fetching with token:", token ? "present" : "missing");
        const response = await fetch(`/api/v1/evaluations/dashboard/list?${params.toString()}`, {
          headers,
        });

        console.log("[Avaliacoes List] Response status:", response.status);

        if (response.ok) {
          const data: PaginatedResponse = await response.json();
          console.log("[Avaliacoes List] Received items:", data.items?.length, "total:", data.total);
          setEvaluations(data.items);
          setTotal(data.total);
          setPages(data.pages);
          setLastRefresh(new Date());
          return;
        } else if (response.status === 401) {
          // Token expired or invalid - logout and redirect to login
          console.error("[Avaliacoes List] Token invalid/expired, logging out");
          logout();
          router.push("/login");
          return;
        } else {
          const errorData = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
          throw new Error(errorData.detail || `Erro ${response.status}`);
        }
      } catch (err) {
        console.error("[Avaliacoes List] Fetch error:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar avaliacoes. Verifique sua conexao.");
      }
      setLastRefresh(new Date());
    } catch (err) {
      setError("Erro ao carregar avaliacoes. Tente novamente.");
      console.error("Error loading evaluations:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, searchTerm, pageSize, token]);

  // Initial load and filter changes - wait for hydration
  useEffect(() => {
    if (!_hasHydrated) return;
    loadEvaluations();
  }, [loadEvaluations, _hasHydrated]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadEvaluations();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, loadEvaluations]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setPage(1);
  };

  // Open reset dialog
  const openResetDialog = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setResetReason("");
    setResetDialogOpen(true);
  };

  // Reset evaluation
  const handleResetEvaluation = async () => {
    if (!selectedEvaluation) return;

    setResetLoading(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/v1/evaluations/${selectedEvaluation.id}/reset`, {
        method: "POST",
        headers,
        body: JSON.stringify({ reason: resetReason || null }),
      });

      if (response.ok) {
        // Reload evaluations
        await loadEvaluations();
        setResetDialogOpen(false);
        setSelectedEvaluation(null);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Erro ao resetar avaliacao");
      }
    } catch (err) {
      console.error("Error resetting evaluation:", err);
      setError("Erro ao resetar avaliacao. Tente novamente.");
    } finally {
      setResetLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get score color
  const getScoreColor = (score: number | null, passed: boolean | null) => {
    if (score === null) return "text-slate-500";
    if (passed === true) return "text-teal-400";
    if (passed === false) return "text-red-400";
    if (score >= 70) return "text-teal-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  // Statistics - computed from current evaluations
  const stats = {
    total: total || evaluations.length,
    completed: evaluations.filter((e) => e.status === "completed").length,
    inProgress: evaluations.filter((e) => e.status === "in_progress").length,
    pending: evaluations.filter((e) => e.status === "pending").length,
    avgScore:
      evaluations.filter((e) => e.score !== null).length > 0
        ? evaluations.filter((e) => e.score !== null).reduce(
            (acc, e) => acc + (e.score || 0),
            0
          ) / evaluations.filter((e) => e.score !== null).length
        : 0,
    passRate:
      evaluations.filter((e) => e.passed !== null).length > 0
        ? (evaluations.filter((e) => e.passed === true).length /
            evaluations.filter((e) => e.passed !== null).length) *
          100
        : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Avaliacoes</h1>
          <p className="text-slate-400">
            Monitore e gerencie todas as avaliacoes de candidatos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm text-slate-400">
              Auto-refresh
            </Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadEvaluations}
            disabled={loading}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg">
              <ClipboardCheck className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-teal-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Concluidas</p>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Loader2 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Em Andamento</p>
              <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Media</p>
              <p className="text-2xl font-bold text-white">{stats.avgScore.toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-900/30 rounded-lg">
              <Target className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Taxa Aprovacao</p>
              <p className="text-2xl font-bold text-white">{stats.passRate.toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-400">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Nome, email ou processo..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluido</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400">Tipo</Label>
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="typing_test">Teste de Digitacao</SelectItem>
                  <SelectItem value="knowledge_test">Teste de Conhecimento</SelectItem>
                  <SelectItem value="behavioral_test">Teste Comportamental</SelectItem>
                  <SelectItem value="technical_test">Teste Tecnico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400">&nbsp;</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex-1 border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
                >
                  <FileDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              Mostrando {evaluations.length} de {total} avaliacoes
            </span>
            <span>Ultima atualizacao: {formatDate(lastRefresh.toISOString())}</span>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Evaluations Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Lista de Avaliacoes</CardTitle>
          <CardDescription className="text-slate-400">
            Clique em uma avaliacao para ver detalhes completos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
            </div>
          ) : evaluations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardCheck className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-white">
                Nenhuma avaliacao encontrada
              </h3>
              <p className="text-slate-400 mt-1">
                Tente ajustar os filtros ou aguarde novas avaliacoes
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-slate-800/50">
                      <TableHead className="text-slate-400">Candidato</TableHead>
                      <TableHead className="text-slate-400">Tipo</TableHead>
                      <TableHead className="text-slate-400">Processo</TableHead>
                      <TableHead className="text-slate-400 text-center">Status</TableHead>
                      <TableHead className="text-slate-400 text-center">Nota</TableHead>
                      <TableHead className="text-slate-400 text-center">Tentativas</TableHead>
                      <TableHead className="text-slate-400">Data</TableHead>
                      <TableHead className="text-slate-400 text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.map((evaluation) => (
                      <TableRow
                        key={evaluation.id}
                        className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                        onClick={() => router.push(`/dashboard/avaliacoes/${evaluation.id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">
                              {evaluation.candidate_name}
                            </p>
                            <p className="text-sm text-slate-400">
                              {evaluation.candidate_email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {EVALUATION_TYPE_LABELS[evaluation.evaluation_type as EvaluationType] ||
                            evaluation.evaluation_type}
                        </TableCell>
                        <TableCell>
                          {evaluation.process_name ? (
                            <Link
                              href={`/dashboard/processos/${evaluation.process_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-teal-400 hover:underline"
                            >
                              {evaluation.process_name}
                            </Link>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={cn(
                              "inline-flex items-center gap-1",
                              STATUS_CONFIG[evaluation.status].color
                            )}
                          >
                            {STATUS_CONFIG[evaluation.status].icon}
                            {STATUS_CONFIG[evaluation.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {evaluation.score !== null ? (
                            <div className="flex flex-col items-center">
                              <span
                                className={cn(
                                  "text-lg font-bold",
                                  getScoreColor(evaluation.score, evaluation.passed)
                                )}
                              >
                                {Math.round(evaluation.score)}%
                              </span>
                              {evaluation.passed !== null && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs mt-1",
                                    evaluation.passed
                                      ? "border-teal-700 text-teal-400"
                                      : "border-red-700 text-red-400"
                                  )}
                                >
                                  {evaluation.passed ? "Aprovado" : "Reprovado"}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-slate-300">
                          {evaluation.attempts}
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {formatDate(evaluation.completed_at || evaluation.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/avaliacoes/${evaluation.id}`);
                              }}
                              className="text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openResetDialog(evaluation);
                              }}
                              className="text-slate-400 hover:text-orange-400 hover:bg-orange-900/20"
                              title="Resetar avaliacao"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={cn(
                            "w-9",
                            page === pageNum
                              ? "bg-teal-600 hover:bg-teal-700"
                              : "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
                          )}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {pages > 5 && (
                      <>
                        <span className="text-slate-500 px-2">...</span>
                        <Button
                          variant={page === pages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pages)}
                          className={cn(
                            "w-9",
                            page === pages
                              ? "bg-teal-600 hover:bg-teal-700"
                              : "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
                          )}
                        >
                          {pages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
                  >
                    Proxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Resetar Avaliacao
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Esta acao permitira que o candidato refaca a avaliacao.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {selectedEvaluation && (
              <div className="p-4 bg-slate-950 rounded-lg space-y-2">
                <p className="text-slate-400 text-sm">Candidato:</p>
                <p className="text-white font-medium">{selectedEvaluation.candidate_name}</p>
                <p className="text-slate-400 text-sm">{selectedEvaluation.candidate_email}</p>
                {selectedEvaluation.score !== null && (
                  <p className="text-slate-400 text-sm mt-2">
                    Nota atual: <span className="text-white">{Math.round(selectedEvaluation.score)}%</span>
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-reason" className="text-slate-400">
                Motivo do reset (opcional)
              </Label>
              <Textarea
                id="reset-reason"
                placeholder="Ex: Problema tecnico, candidato solicitou nova tentativa..."
                value={resetReason}
                onChange={(e) => setResetReason(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                rows={3}
              />
            </div>

            <Alert className="bg-orange-900/20 border-orange-800">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <AlertDescription className="text-orange-300/80 text-sm">
                Esta acao ira zerar a nota e tentativas do candidato.
                Ele podera realizar o teste novamente.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
              disabled={resetLoading}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResetEvaluation}
              disabled={resetLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {resetLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Confirmar Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
