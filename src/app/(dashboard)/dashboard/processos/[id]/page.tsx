"use client";

/**
 * Selection Process Detail Page - Process overview with candidate and evaluation info.
 *
 * Features:
 * - Process overview with candidate info
 * - All evaluations for this process
 * - Progress visualization
 */

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Mail,
  Phone,
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
  Users,
  BarChart3,
  Eye,
  ClipboardCheck,
  Play,
  Pause,
  Award,
  ChevronRight,
  MapPin,
  Building,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface SelectionProcess {
  id: string;
  job_id: string;
  job_title: string;
  job_department: string;
  job_location: string;
  job_salary_range: string | null;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  status: ProcessStatus;
  stage: ProcessStage;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
  recruiter_name: string | null;
}

interface ProcessEvaluation {
  id: string;
  process_id: string;
  evaluation_type: string;
  status: EvaluationStatus;
  score: number | null;
  max_score: number;
  passed: boolean | null;
  required: boolean;
  order: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface ProcessStageInfo {
  stage: ProcessStage;
  label: string;
  completed: boolean;
  current: boolean;
  date: string | null;
}

type ProcessStatus = "active" | "on_hold" | "completed" | "rejected" | "withdrawn";
type ProcessStage = "application" | "screening" | "evaluation" | "interview" | "offer" | "hired";
type EvaluationStatus = "pending" | "in_progress" | "completed" | "expired" | "cancelled";

// Status configuration
const PROCESS_STATUS_CONFIG: Record<ProcessStatus, { label: string; color: string; bgColor: string }> = {
  active: {
    label: "Ativo",
    color: "text-teal-400",
    bgColor: "bg-teal-900/50 border-teal-800",
  },
  on_hold: {
    label: "Em Espera",
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/50 border-yellow-800",
  },
  completed: {
    label: "Concluido",
    color: "text-blue-400",
    bgColor: "bg-blue-900/50 border-blue-800",
  },
  rejected: {
    label: "Rejeitado",
    color: "text-red-400",
    bgColor: "bg-red-900/50 border-red-800",
  },
  withdrawn: {
    label: "Desistente",
    color: "text-slate-400",
    bgColor: "bg-slate-800 border-slate-700",
  },
};

const STAGE_CONFIG: Record<ProcessStage, { label: string; icon: React.ReactNode }> = {
  application: { label: "Candidatura", icon: <FileText className="h-4 w-4" /> },
  screening: { label: "Triagem", icon: <Eye className="h-4 w-4" /> },
  evaluation: { label: "Avaliacao", icon: <ClipboardCheck className="h-4 w-4" /> },
  interview: { label: "Entrevista", icon: <Users className="h-4 w-4" /> },
  offer: { label: "Proposta", icon: <DollarSign className="h-4 w-4" /> },
  hired: { label: "Contratado", icon: <Award className="h-4 w-4" /> },
};

const EVALUATION_STATUS_CONFIG: Record<EvaluationStatus, { label: string; color: string; icon: React.ReactNode }> = {
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

const EVALUATION_TYPE_LABELS: Record<string, string> = {
  typing_test: "Teste de Digitacao",
  knowledge_test: "Teste de Conhecimento",
  behavioral_test: "Teste Comportamental",
  technical_test: "Teste Tecnico",
};

// Mock data
const MOCK_PROCESS: SelectionProcess = {
  id: "proc-001",
  job_id: "job-001",
  job_title: "Atendente Call Center",
  job_department: "Operacoes",
  job_location: "Sao Paulo, SP",
  job_salary_range: "R$ 1.800 - R$ 2.200",
  candidate_id: "cand-001",
  candidate_name: "Maria Silva Santos",
  candidate_email: "maria.silva@email.com",
  candidate_phone: "(11) 99999-1234",
  status: "active",
  stage: "evaluation",
  started_at: "2024-01-05T10:00:00Z",
  completed_at: null,
  created_at: "2024-01-05T10:00:00Z",
  updated_at: "2024-01-08T10:15:00Z",
  notes: "Candidata com boa comunicacao. Prosseguir com avaliacoes.",
  recruiter_name: "Ana Costa",
};

const MOCK_EVALUATIONS: ProcessEvaluation[] = [
  {
    id: "eval-001",
    process_id: "proc-001",
    evaluation_type: "typing_test",
    status: "completed",
    score: 85,
    max_score: 100,
    passed: true,
    required: true,
    order: 1,
    started_at: "2024-01-08T10:00:00Z",
    completed_at: "2024-01-08T10:15:00Z",
    created_at: "2024-01-08T09:00:00Z",
  },
  {
    id: "eval-002",
    process_id: "proc-001",
    evaluation_type: "knowledge_test",
    status: "pending",
    score: null,
    max_score: 100,
    passed: null,
    required: true,
    order: 2,
    started_at: null,
    completed_at: null,
    created_at: "2024-01-08T09:00:00Z",
  },
  {
    id: "eval-003",
    process_id: "proc-001",
    evaluation_type: "behavioral_test",
    status: "pending",
    score: null,
    max_score: 100,
    passed: null,
    required: false,
    order: 3,
    started_at: null,
    completed_at: null,
    created_at: "2024-01-08T09:00:00Z",
  },
];

const MOCK_STAGES: ProcessStageInfo[] = [
  { stage: "application", label: "Candidatura", completed: true, current: false, date: "2024-01-05T10:00:00Z" },
  { stage: "screening", label: "Triagem", completed: true, current: false, date: "2024-01-06T14:00:00Z" },
  { stage: "evaluation", label: "Avaliacao", completed: false, current: true, date: null },
  { stage: "interview", label: "Entrevista", completed: false, current: false, date: null },
  { stage: "offer", label: "Proposta", completed: false, current: false, date: null },
  { stage: "hired", label: "Contratado", completed: false, current: false, date: null },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProcessoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const processId = params.id as string;

  // State
  const [process, setProcess] = useState<SelectionProcess | null>(null);
  const [evaluations, setEvaluations] = useState<ProcessEvaluation[]>([]);
  const [stages, setStages] = useState<ProcessStageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Load process data
  useEffect(() => {
    const loadProcess = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API
        try {
          const response = await fetch(`/api/v1/selection/processes/${processId}`, {
            headers: { "Content-Type": "application/json" },
          });

          if (response.ok) {
            const data = await response.json();
            setProcess(data.process);
            setEvaluations(data.evaluations || []);
            setStages(data.stages || []);
            return;
          }
        } catch {
          // API not available, use mock data
        }

        // Use mock data
        setProcess(MOCK_PROCESS);
        setEvaluations(MOCK_EVALUATIONS);
        setStages(MOCK_STAGES);
      } catch (err) {
        setError("Erro ao carregar processo. Tente novamente.");
        console.error("Error loading process:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProcess();
  }, [processId]);

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
  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-slate-500";
    if (score >= 80) return "text-teal-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  // Calculate progress
  const calculateProgress = () => {
    const completedEvaluations = evaluations.filter((e) => e.status === "completed").length;
    return evaluations.length > 0 ? (completedEvaluations / evaluations.length) * 100 : 0;
  };

  // Calculate overall score
  const calculateOverallScore = () => {
    const completedWithScore = evaluations.filter((e) => e.score !== null);
    if (completedWithScore.length === 0) return null;
    return (
      completedWithScore.reduce((acc, e) => acc + (e.score || 0), 0) /
      completedWithScore.length
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (error || !process) {
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
            {error || "Processo nao encontrado"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusConfig = PROCESS_STATUS_CONFIG[process.status];
  const stageConfig = STAGE_CONFIG[process.stage];
  const overallScore = calculateOverallScore();
  const progress = calculateProgress();

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
        Voltar
      </Button>

      {/* Header Card */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Candidate Info */}
            <div className="flex items-start gap-4 flex-1">
              <Avatar className="h-16 w-16 border-2 border-slate-700">
                <AvatarFallback className="bg-slate-800 text-teal-400 text-lg font-bold">
                  {getInitials(process.candidate_name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-white">
                      {process.candidate_name}
                    </h1>
                    <Badge className={cn("flex items-center gap-1", statusConfig.bgColor, statusConfig.color)}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                    {stageConfig.icon}
                    <span>Etapa atual: {stageConfig.label}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <a
                    href={`mailto:${process.candidate_email}`}
                    className="flex items-center gap-1 text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    {process.candidate_email}
                  </a>
                  {process.candidate_phone && (
                    <a
                      href={`tel:${process.candidate_phone}`}
                      className="flex items-center gap-1 text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {process.candidate_phone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Job Info */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 lg:min-w-[280px]">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-5 w-5 text-teal-400" />
                <span className="font-semibold text-white">{process.job_title}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Building className="h-4 w-4" />
                  <span>{process.job_department}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="h-4 w-4" />
                  <span>{process.job_location}</span>
                </div>
                {process.job_salary_range && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <DollarSign className="h-4 w-4" />
                    <span>{process.job_salary_range}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Overall Score */}
            <div className="flex flex-col items-center gap-2 bg-slate-800 rounded-xl p-4 border border-slate-700">
              <span className="text-xs text-slate-400">Nota Media</span>
              <div className="relative">
                <svg className="w-20 h-20">
                  <circle
                    className="text-slate-700"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                    r="34"
                    cx="40"
                    cy="40"
                  />
                  <circle
                    className={getScoreColor(overallScore)}
                    strokeWidth="6"
                    strokeDasharray={`${(overallScore || 0) * 2.14} 214`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="34"
                    cx="40"
                    cy="40"
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn("text-xl font-bold", getScoreColor(overallScore))}>
                    {overallScore !== null ? `${overallScore.toFixed(0)}%` : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Stages */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-400" />
            Progresso do Processo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {stages.map((stage, index) => (
              <div key={stage.stage} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                      stage.completed
                        ? "bg-teal-600 border-teal-500 text-white"
                        : stage.current
                        ? "bg-teal-900/50 border-teal-500 text-teal-400"
                        : "bg-slate-800 border-slate-700 text-slate-500"
                    )}
                  >
                    {stage.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      STAGE_CONFIG[stage.stage].icon
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-2 whitespace-nowrap",
                      stage.current ? "text-teal-400 font-medium" : "text-slate-400"
                    )}
                  >
                    {stage.label}
                  </span>
                  {stage.date && (
                    <span className="text-[10px] text-slate-500">
                      {new Date(stage.date).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={cn(
                      "w-12 lg:w-20 h-0.5 mx-2",
                      stage.completed ? "bg-teal-500" : "bg-slate-700"
                    )}
                  />
                )}
              </div>
            ))}
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
            value="evaluations"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Avaliacoes ({evaluations.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Evaluation Progress */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-teal-400" />
                    Progresso das Avaliacoes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">
                      {evaluations.filter((e) => e.status === "completed").length} de{" "}
                      {evaluations.length} avaliacoes concluidas
                    </span>
                    <span className="text-sm font-medium text-white">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-slate-800" />

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                      <CheckCircle className="h-5 w-5 text-teal-400 mx-auto mb-1" />
                      <p className="text-xl font-bold text-white">
                        {evaluations.filter((e) => e.passed === true).length}
                      </p>
                      <p className="text-xs text-slate-400">Aprovadas</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                      <Clock className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                      <p className="text-xl font-bold text-white">
                        {evaluations.filter((e) => e.status === "pending" || e.status === "in_progress").length}
                      </p>
                      <p className="text-xs text-slate-400">Pendentes</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                      <XCircle className="h-5 w-5 text-red-400 mx-auto mb-1" />
                      <p className="text-xl font-bold text-white">
                        {evaluations.filter((e) => e.passed === false).length}
                      </p>
                      <p className="text-xs text-slate-400">Reprovadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Evaluations List */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Avaliacoes do Processo</CardTitle>
                  <CardDescription className="text-slate-400">
                    Lista de todas as avaliacoes vinculadas a este processo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {evaluations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <ClipboardCheck className="h-10 w-10 text-slate-600 mb-3" />
                      <p className="text-slate-400">Nenhuma avaliacao cadastrada</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {evaluations
                        .sort((a, b) => a.order - b.order)
                        .map((evaluation) => (
                          <Link
                            key={evaluation.id}
                            href={`/dashboard/avaliacoes/${evaluation.id}`}
                            className="block"
                          >
                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors">
                              <div className="flex items-center gap-4">
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                    evaluation.status === "completed" && evaluation.passed
                                      ? "bg-teal-900/50 text-teal-400"
                                      : evaluation.status === "completed" && !evaluation.passed
                                      ? "bg-red-900/50 text-red-400"
                                      : "bg-slate-700 text-slate-400"
                                  )}
                                >
                                  {evaluation.order}
                                </div>
                                <div>
                                  <p className="font-medium text-white">
                                    {EVALUATION_TYPE_LABELS[evaluation.evaluation_type] ||
                                      evaluation.evaluation_type}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      className={cn(
                                        "text-xs",
                                        EVALUATION_STATUS_CONFIG[evaluation.status].color
                                      )}
                                    >
                                      {EVALUATION_STATUS_CONFIG[evaluation.status].icon}
                                      <span className="ml-1">
                                        {EVALUATION_STATUS_CONFIG[evaluation.status].label}
                                      </span>
                                    </Badge>
                                    {evaluation.required && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs border-yellow-700 text-yellow-400"
                                      >
                                        Obrigatoria
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {evaluation.score !== null && (
                                  <div className="text-right">
                                    <p className={cn("text-lg font-bold", getScoreColor(evaluation.score))}>
                                      {evaluation.score}%
                                    </p>
                                    {evaluation.passed !== null && (
                                      <p
                                        className={cn(
                                          "text-xs",
                                          evaluation.passed ? "text-teal-400" : "text-red-400"
                                        )}
                                      >
                                        {evaluation.passed ? "Aprovado" : "Reprovado"}
                                      </p>
                                    )}
                                  </div>
                                )}
                                <ChevronRight className="h-5 w-5 text-slate-500" />
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Process Details */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-teal-400" />
                    Detalhes do Processo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ID</span>
                      <span className="text-white font-mono text-xs">{process.id}</span>
                    </div>
                    <Separator className="bg-slate-800" />
                    <div className="flex justify-between">
                      <span className="text-slate-400">Inicio</span>
                      <span className="text-white">{formatDate(process.started_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ultima atualizacao</span>
                      <span className="text-white">{formatDate(process.updated_at)}</span>
                    </div>
                    {process.recruiter_name && (
                      <>
                        <Separator className="bg-slate-800" />
                        <div className="flex justify-between">
                          <span className="text-slate-400">Recrutador</span>
                          <span className="text-white">{process.recruiter_name}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Acoes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Link href={`/candidates/${process.candidate_id}`}>
                      <User className="h-4 w-4 mr-2" />
                      Ver Perfil do Candidato
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Link href={`/jobs/${process.job_id}`}>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Ver Vaga
                    </Link>
                  </Button>
                  {process.status === "active" && (
                    <>
                      <Separator className="bg-slate-800 my-3" />
                      <Button
                        size="sm"
                        className="w-full bg-teal-600 hover:bg-teal-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Avancar Etapa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-yellow-700 text-yellow-400 hover:bg-yellow-900/20"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar Processo
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {process.notes && (
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Observacoes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300">{process.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Evaluations Table Tab */}
        <TabsContent value="evaluations">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Todas as Avaliacoes</CardTitle>
              <CardDescription className="text-slate-400">
                Detalhes completos de cada avaliacao
              </CardDescription>
            </CardHeader>
            <CardContent>
              {evaluations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ClipboardCheck className="h-12 w-12 text-slate-600 mb-4" />
                  <h3 className="text-lg font-semibold text-white">
                    Nenhuma avaliacao cadastrada
                  </h3>
                  <p className="text-slate-400 mt-1">
                    As avaliacoes serao exibidas aqui quando configuradas
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-800 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-slate-800/50">
                        <TableHead className="text-slate-400">#</TableHead>
                        <TableHead className="text-slate-400">Tipo</TableHead>
                        <TableHead className="text-slate-400 text-center">Status</TableHead>
                        <TableHead className="text-slate-400 text-center">Nota</TableHead>
                        <TableHead className="text-slate-400 text-center">Resultado</TableHead>
                        <TableHead className="text-slate-400">Data</TableHead>
                        <TableHead className="text-slate-400 text-right">Acoes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evaluations
                        .sort((a, b) => a.order - b.order)
                        .map((evaluation) => (
                          <TableRow
                            key={evaluation.id}
                            className="border-slate-800 hover:bg-slate-800/50"
                          >
                            <TableCell className="text-slate-300 font-medium">
                              {evaluation.order}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-white">
                                  {EVALUATION_TYPE_LABELS[evaluation.evaluation_type] ||
                                    evaluation.evaluation_type}
                                </span>
                                {evaluation.required && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-yellow-700 text-yellow-400"
                                  >
                                    Obrigatoria
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                className={cn(
                                  "inline-flex items-center gap-1",
                                  EVALUATION_STATUS_CONFIG[evaluation.status].color
                                )}
                              >
                                {EVALUATION_STATUS_CONFIG[evaluation.status].icon}
                                {EVALUATION_STATUS_CONFIG[evaluation.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={cn("font-bold", getScoreColor(evaluation.score))}>
                                {evaluation.score !== null ? `${evaluation.score}%` : "-"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {evaluation.passed !== null ? (
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
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-slate-400 text-sm">
                              {formatDate(evaluation.completed_at || evaluation.created_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Link href={`/dashboard/avaliacoes/${evaluation.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
