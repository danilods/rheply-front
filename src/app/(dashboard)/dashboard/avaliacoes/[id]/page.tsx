"use client";

/**
 * Evaluation Detail Page - Full evaluation details with timeline and attempts.
 *
 * Features:
 * - Full evaluation details
 * - Candidate info
 * - All attempts with results
 * - Status timeline
 */

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Target,
  FileText,
  User,
  Briefcase,
  History,
  AlertTriangle,
  Award,
  Timer,
  BarChart3,
  Eye,
  Keyboard,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Evaluation {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  candidate_cpf: string | null;
  evaluation_type: string;
  status: EvaluationStatus;
  score: number | null;
  max_score: number;
  passing_score: number | null;
  passed: boolean | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  attempts: number;
  max_attempts: number;
  time_limit_seconds: number | null;
  duration_seconds: number | null;
  process_id: string | null;
  process_name: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

interface EvaluationAttempt {
  id: string;
  evaluation_id: string;
  attempt_number: number;
  status: EvaluationStatus;
  score: number | null;
  max_score: number;
  passed: boolean | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  wpm: number | null;
  accuracy: number | null;
  errors: number | null;
  is_suspicious: boolean;
  paste_attempts: number;
  focus_lost_count: number;
  feedback: string | null;
}

interface TimelineEvent {
  id: string;
  type: "created" | "started" | "completed" | "expired" | "attempt" | "status_change";
  title: string;
  description: string;
  date: string;
  metadata?: Record<string, unknown>;
}

type EvaluationStatus = "pending" | "in_progress" | "completed" | "expired" | "cancelled";

// Status configuration
const STATUS_CONFIG: Record<EvaluationStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pendente",
    color: "text-slate-300",
    bgColor: "bg-slate-800 border-slate-700",
    icon: <Clock className="h-4 w-4" />,
  },
  in_progress: {
    label: "Em Andamento",
    color: "text-blue-400",
    bgColor: "bg-blue-900/50 border-blue-800",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
  },
  completed: {
    label: "Concluido",
    color: "text-teal-400",
    bgColor: "bg-teal-900/50 border-teal-800",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  expired: {
    label: "Expirado",
    color: "text-orange-400",
    bgColor: "bg-orange-900/50 border-orange-800",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  cancelled: {
    label: "Cancelado",
    color: "text-red-400",
    bgColor: "bg-red-900/50 border-red-800",
    icon: <XCircle className="h-4 w-4" />,
  },
};

const EVALUATION_TYPE_LABELS: Record<string, string> = {
  typing_test: "Teste de Digitacao",
  knowledge_test: "Teste de Conhecimento",
  behavioral_test: "Teste Comportamental",
  technical_test: "Teste Tecnico",
};

const TIMELINE_ICONS: Record<string, React.ReactNode> = {
  created: <FileText className="h-4 w-4" />,
  started: <Clock className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  expired: <AlertCircle className="h-4 w-4" />,
  attempt: <Target className="h-4 w-4" />,
  status_change: <RefreshCw className="h-4 w-4" />,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AvaliacaoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const evaluationId = params.id as string;
  const { token, _hasHydrated, logout } = useAuthStore();

  // State
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [attempts, setAttempts] = useState<EvaluationAttempt[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Load evaluation data - wait for hydration
  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage
    if (!_hasHydrated) {
      console.log("[Avaliacao Detail] Waiting for auth hydration...");
      return;
    }

    const loadEvaluation = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("[Avaliacao Detail] Starting fetch, evaluationId:", evaluationId, "token:", token ? "present" : "missing");

        // Try to fetch from API
        try {
          const response = await fetch(`/api/v1/evaluations/${evaluationId}`, {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          });

          console.log("[Avaliacao Detail] Response status:", response.status);

          if (response.status === 401) {
            // Token expired or invalid - logout and redirect to login
            console.error("[Avaliacao Detail] Token invalid/expired, logging out");
            logout();
            router.push("/login");
            return;
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
            throw new Error(errorData.detail || `Erro ${response.status}`);
          }

          if (response.ok) {
            const data = await response.json();
            // Backend returns EvaluationWithDetails directly with attempts as a property
            // Map the API response to our frontend format
            // Determine passed status from multiple sources
            let passedStatus: boolean | null = null;
            if (data.status === "passed") {
              passedStatus = true;
            } else if (data.status === "failed") {
              passedStatus = false;
            } else if (data.result_data?.passed !== undefined) {
              passedStatus = Boolean(data.result_data.passed);
            } else if (data.score !== null && data.passing_score !== null) {
              passedStatus = data.score >= data.passing_score;
            }

            const evalData: Evaluation = {
              id: data.id,
              candidate_id: data.selection_process_id || "",
              candidate_name: data.candidate_name || "N/A",
              candidate_email: data.candidate_email || "N/A",
              candidate_phone: data.candidate_phone || null,
              candidate_cpf: data.candidate_cpf || null,
              evaluation_type: data.template?.evaluation_type?.code || "typing_test",
              status: passedStatus === true ? "completed" : passedStatus === false ? "completed" : data.status,
              score: data.score_percentage || data.score,
              max_score: data.max_score || 100,
              passing_score: data.passing_score || data.template?.passing_score || null,
              passed: passedStatus,
              started_at: data.started_at,
              completed_at: data.completed_at,
              created_at: data.created_at,
              updated_at: data.updated_at,
              attempts: data.attempts_used || 0,
              max_attempts: data.max_attempts || 3,
              time_limit_seconds: data.template?.duration_minutes ? data.template.duration_minutes * 60 : null,
              duration_seconds: data.result_data?.duration_seconds || null,
              process_id: data.selection_process_id,
              process_name: data.template?.name || "Processo Seletivo",
              notes: data.feedback || data.internal_notes,
              metadata: data.result_data || null,
            };
            console.log("[Avaliacao Detail] Setting evaluation data:", evalData);
            setEvaluation(evalData);

            // Map attempts
            const mappedAttempts: EvaluationAttempt[] = (data.attempts || []).map((a: Record<string, unknown>) => {
              const resultData = a.result_data as Record<string, unknown> || {};
              const attemptPassed = resultData.passed !== undefined
                ? Boolean(resultData.passed)
                : (a.score !== null && data.passing_score !== null ? (a.score as number) >= data.passing_score : null);

              return {
                id: a.id as string,
                evaluation_id: evaluationId,
                attempt_number: a.attempt_number as number,
                status: a.status as EvaluationStatus || "completed",
                score: a.score as number | null,
                max_score: 100,
                passed: attemptPassed,
                started_at: a.started_at as string,
                completed_at: a.completed_at as string | null,
                duration_seconds: a.duration_seconds as number | null,
                wpm: resultData.wpm as number || null,
                accuracy: resultData.accuracy as number || null,
                errors: resultData.errors as number || 0,
                is_suspicious: resultData.is_suspicious as boolean || false,
                paste_attempts: resultData.paste_attempts as number || 0,
                focus_lost_count: resultData.focus_lost_count as number || 0,
                feedback: null,
              };
            });
            setAttempts(mappedAttempts);

            // Build timeline from data
            const events: TimelineEvent[] = [];
            if (data.created_at) {
              events.push({
                id: "tl-created",
                type: "created",
                title: "Avaliacao Criada",
                description: "Avaliacao criada para o processo seletivo",
                date: data.created_at,
              });
            }
            if (data.started_at) {
              events.push({
                id: "tl-started",
                type: "started",
                title: "Teste Iniciado",
                description: "Candidato iniciou o teste",
                date: data.started_at,
              });
            }
            if (data.completed_at) {
              const passed = data.status === "passed";
              events.push({
                id: "tl-completed",
                type: "completed",
                title: "Avaliacao Concluida",
                description: passed
                  ? `Candidato aprovado com nota ${data.score_percentage || data.score}%`
                  : `Candidato ${data.status === "failed" ? "reprovado" : "finalizou"} com nota ${data.score_percentage || data.score || 0}%`,
                date: data.completed_at,
                metadata: { score: data.score_percentage || data.score, passed },
              });
            }
            // Sort timeline by date descending
            events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTimeline(events);
            console.log("[Avaliacao Detail] All data set successfully, returning...");
            return;
          }
        } catch (err) {
          console.error("[Avaliacao Detail] Error fetching from API:", err);
          throw err;
        }

        // If we reach here, API failed to return data
        throw new Error("Avaliacao nao encontrada");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar avaliacao";
        console.error("[Avaliacao Detail] Setting error:", errorMessage);
        setError(errorMessage);
        console.error("Error loading evaluation:", err);
      } finally {
        console.log("[Avaliacao Detail] Finally block - setting loading to false");
        setLoading(false);
      }
    };

    loadEvaluation();
  }, [evaluationId, token, _hasHydrated]);

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

  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return "-";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Get score color
  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-slate-500";
    if (score >= 80) return "text-teal-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  console.log("[Avaliacao Detail] Render state:", { loading, error, hasEvaluation: !!evaluation });

  if (loading) {
    console.log("[Avaliacao Detail] Showing loading spinner");
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (error || !evaluation) {
    console.log("[Avaliacao Detail] Showing error state:", error);
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit text-slate-400 hover:text-white"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Alert variant="destructive" className="bg-red-900/20 border-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {error || "Avaliacao nao encontrada"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[evaluation.status] || STATUS_CONFIG.pending;

  console.log("[Avaliacao Detail] Rendering with:", {
    evaluationId: evaluation.id,
    status: evaluation.status,
    statusConfig: statusConfig,
    candidateName: evaluation.candidate_name,
  });

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-fit text-slate-400 hover:text-white"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Avaliacoes
      </Button>

      {/* Header Card */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Candidate Avatar */}
            <Avatar className="h-20 w-20 border-2 border-slate-700">
              <AvatarFallback className="bg-slate-800 text-teal-400 text-xl font-bold">
                {getInitials(evaluation.candidate_name)}
              </AvatarFallback>
            </Avatar>

            {/* Candidate Info */}
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">
                    {evaluation.candidate_name}
                  </h1>
                  <Badge className={cn("flex items-center gap-1", statusConfig.bgColor, statusConfig.color)}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </Badge>
                  {evaluation.passed !== null && (
                    <Badge
                      variant="outline"
                      className={cn(
                        evaluation.passed
                          ? "border-teal-700 text-teal-400"
                          : "border-red-700 text-red-400"
                      )}
                    >
                      {evaluation.passed ? "Aprovado" : "Reprovado"}
                    </Badge>
                  )}
                </div>
                <p className="text-slate-400 mt-1">
                  {EVALUATION_TYPE_LABELS[evaluation.evaluation_type] || evaluation.evaluation_type}
                </p>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <a
                  href={`mailto:${evaluation.candidate_email}`}
                  className="flex items-center gap-1 text-slate-400 hover:text-teal-400 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {evaluation.candidate_email}
                </a>
                {evaluation.candidate_phone && (
                  <a
                    href={`tel:${evaluation.candidate_phone}`}
                    className="flex items-center gap-1 text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    {evaluation.candidate_phone}
                  </a>
                )}
                {evaluation.process_name && (
                  <Link
                    href={`/dashboard/processos/${evaluation.process_id}`}
                    className="flex items-center gap-1 text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    <Briefcase className="h-4 w-4" />
                    {evaluation.process_name}
                  </Link>
                )}
              </div>
            </div>

            {/* Score Display */}
            <div className="flex flex-col items-center gap-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
              <span className="text-sm text-slate-400">Nota Final</span>
              <div className="relative">
                <svg className="w-24 h-24">
                  <circle
                    className="text-slate-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="44"
                    cx="48"
                    cy="48"
                  />
                  <circle
                    className={getScoreColor(evaluation.score)}
                    strokeWidth="8"
                    strokeDasharray={`${(evaluation.score || 0) * 2.76} 276`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="44"
                    cx="48"
                    cy="48"
                    transform="rotate(-90 48 48)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn("text-2xl font-bold", getScoreColor(evaluation.score))}>
                    {evaluation.score !== null ? `${evaluation.score}%` : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-900 border border-slate-800 p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Visao Geral
          </TabsTrigger>
          <TabsTrigger
            value="attempts"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
          >
            <Target className="h-4 w-4 mr-2" />
            Tentativas ({attempts.length})
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
          >
            <History className="h-4 w-4 mr-2" />
            Historico
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metrics Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Metrics */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-teal-400" />
                    Metricas de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <Keyboard className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">
                        {(evaluation.metadata?.wpm as number) || "-"}
                      </p>
                      <p className="text-xs text-slate-400">WPM</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <Target className="h-6 w-6 text-teal-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">
                        {(evaluation.metadata?.accuracy as number)?.toFixed(1) || "-"}%
                      </p>
                      <p className="text-xs text-slate-400">Precisao</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <AlertTriangle className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">
                        {(evaluation.metadata?.errors as number) || "-"}
                      </p>
                      <p className="text-xs text-slate-400">Erros</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <Timer className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">
                        {formatDuration(evaluation.duration_seconds)}
                      </p>
                      <p className="text-xs text-slate-400">Duracao</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Progresso da Nota</span>
                      <span className={getScoreColor(evaluation.score)}>
                        {evaluation.score || 0}% / {evaluation.max_score}%
                      </span>
                    </div>
                    <Progress
                      value={evaluation.score || 0}
                      className="h-3 bg-slate-800"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>0%</span>
                      {evaluation.passing_score !== null && (
                        <span className="text-yellow-400">Minimo: {evaluation.passing_score}%</span>
                      )}
                      <span>100%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attempt Summary */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-teal-400" />
                    Resumo das Tentativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-slate-400">
                          Tentativas utilizadas
                        </span>
                        <span className="text-sm text-white">
                          {evaluation.attempts} de {evaluation.max_attempts}
                        </span>
                      </div>
                      <Progress
                        value={(evaluation.attempts / evaluation.max_attempts) * 100}
                        className="h-2 bg-slate-800"
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        {evaluation.max_attempts - evaluation.attempts}
                      </p>
                      <p className="text-xs text-slate-400">restantes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Evaluation Details */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-teal-400" />
                    Detalhes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ID</span>
                      <span className="text-white font-mono text-xs">
                        {evaluation.id}
                      </span>
                    </div>
                    <Separator className="bg-slate-800" />
                    <div className="flex justify-between">
                      <span className="text-slate-400">Criado em</span>
                      <span className="text-white">{formatDate(evaluation.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Iniciado em</span>
                      <span className="text-white">{formatDate(evaluation.started_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Concluido em</span>
                      <span className="text-white">{formatDate(evaluation.completed_at)}</span>
                    </div>
                    <Separator className="bg-slate-800" />
                    <div className="flex justify-between">
                      <span className="text-slate-400">Limite de tempo</span>
                      <span className="text-white">
                        {evaluation.time_limit_seconds
                          ? `${evaluation.time_limit_seconds / 60} minutos`
                          : "Sem limite"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Candidate Card */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-teal-400" />
                    Candidato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-400">Nome</span>
                    <p className="text-white font-medium">{evaluation.candidate_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Email</span>
                    <p className="text-white">{evaluation.candidate_email}</p>
                  </div>
                  {evaluation.candidate_phone && (
                    <div>
                      <span className="text-slate-400">Telefone</span>
                      <p className="text-white">{evaluation.candidate_phone}</p>
                    </div>
                  )}
                  {evaluation.candidate_cpf && (
                    <div>
                      <span className="text-slate-400">CPF</span>
                      <p className="text-white">{evaluation.candidate_cpf}</p>
                    </div>
                  )}
                  <Separator className="bg-slate-800" />
                  <Link href={`/candidates/${evaluation.candidate_id}`} className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Perfil Completo
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Notes */}
              {evaluation.notes && (
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Observacoes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300">{evaluation.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Attempts Tab */}
        <TabsContent value="attempts" className="space-y-4">
          {attempts.length === 0 ? (
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-white">
                  Nenhuma tentativa registrada
                </h3>
                <p className="text-slate-400 mt-1">
                  O candidato ainda nao iniciou a avaliacao
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {attempts.map((attempt) => (
                <Card key={attempt.id} className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Award className="h-5 w-5 text-teal-400" />
                        Tentativa #{attempt.attempt_number}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            (STATUS_CONFIG[attempt.status] || STATUS_CONFIG.completed).bgColor,
                            (STATUS_CONFIG[attempt.status] || STATUS_CONFIG.completed).color
                          )}
                        >
                          {(STATUS_CONFIG[attempt.status] || STATUS_CONFIG.completed).label}
                        </Badge>
                        {attempt.passed !== null && (
                          <Badge
                            variant="outline"
                            className={cn(
                              attempt.passed
                                ? "border-teal-700 text-teal-400"
                                : "border-red-700 text-red-400"
                            )}
                          >
                            {attempt.passed ? "Aprovado" : "Reprovado"}
                          </Badge>
                        )}
                        {attempt.is_suspicious && (
                          <Badge variant="outline" className="border-yellow-700 text-yellow-400">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Suspeito
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-slate-400">
                      {formatDate(attempt.started_at)} - {formatDate(attempt.completed_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                      <div className="bg-slate-800 rounded-lg p-3 text-center">
                        <p className={cn("text-xl font-bold", getScoreColor(attempt.score))}>
                          {attempt.score !== null ? `${attempt.score}%` : "-"}
                        </p>
                        <p className="text-xs text-slate-400">Nota</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-white">
                          {attempt.wpm || "-"}
                        </p>
                        <p className="text-xs text-slate-400">WPM</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-white">
                          {attempt.accuracy?.toFixed(1) || "-"}%
                        </p>
                        <p className="text-xs text-slate-400">Precisao</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-white">
                          {attempt.errors || "-"}
                        </p>
                        <p className="text-xs text-slate-400">Erros</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-white">
                          {formatDuration(attempt.duration_seconds)}
                        </p>
                        <p className="text-xs text-slate-400">Duracao</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-white">
                          {attempt.focus_lost_count}
                        </p>
                        <p className="text-xs text-slate-400">Perdas de Foco</p>
                      </div>
                    </div>

                    {attempt.feedback && (
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <p className="text-sm text-slate-300">
                          <span className="font-medium text-slate-400">Feedback: </span>
                          {attempt.feedback}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Historico de Atividades</CardTitle>
              <CardDescription className="text-slate-400">
                Linha do tempo da avaliacao
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <History className="h-12 w-12 text-slate-600 mb-4" />
                  <h3 className="text-lg font-semibold text-white">
                    Nenhuma atividade registrada
                  </h3>
                </div>
              ) : (
                <div className="space-y-6">
                  {timeline.map((event, index) => (
                    <div key={event.id} className="relative pl-8">
                      {index !== timeline.length - 1 && (
                        <div className="absolute left-[13px] top-8 h-full w-0.5 bg-slate-700" />
                      )}
                      <div className="absolute left-0 top-1 h-7 w-7 rounded-full bg-slate-800 border-2 border-teal-600 flex items-center justify-center text-teal-400">
                        {TIMELINE_ICONS[event.type] || <Calendar className="h-4 w-4" />}
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <h4 className="font-semibold text-white">{event.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">
                          {event.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
