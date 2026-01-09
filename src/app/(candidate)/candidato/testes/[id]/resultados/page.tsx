"use client";

/**
 * Página de Resultados - Exibe os resultados do teste de digitação.
 *
 * Mostra métricas detalhadas, feedback, e permite download/compartilhamento
 * dos resultados.
 */

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  MinusCircle,
  Clock,
  Target,
  Keyboard,
  TrendingUp,
  ArrowLeft,
  Download,
  Share2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { typingTestApi } from "@/services/typing-test-api";
import { useTypingTestStore } from "@/store/typing-test-store";
import {
  TypingTestDetail,
  EvaluationResult,
  TestStatus,
  DIFFICULTY_LABELS,
  RESULT_LABELS,
} from "@/types/typing-test";

export default function ResultadosPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  // State
  const [isClient, setIsClient] = useState(false);
  const [test, setTest] = useState<TypingTestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store - pode ter resultado em cache
  const { result: cachedResult, clearResult } = useTypingTestStore();

  // Hydration protection
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carregar dados do teste
  useEffect(() => {
    if (!isClient || !testId) return;

    const fetchTest = async () => {
      setIsLoading(true);
      try {
        const testData = await typingTestApi.getPublicTest(testId);
        setTest(testData);

        // Se não completado, redirecionar
        if (testData.status !== TestStatus.COMPLETED) {
          router.push(`/candidato/testes/${testId}`);
        }
      } catch (err) {
        console.error("Erro ao carregar resultado:", err);
        setError("Não foi possível carregar os resultados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [isClient, testId, router]);

  // Limpar cache ao sair
  useEffect(() => {
    return () => {
      clearResult();
    };
  }, [clearResult]);

  // Loading
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error
  if (error || !test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Erro ao carregar resultados</h2>
        <p className="text-muted-foreground">{error || "Teste não encontrado"}</p>
        <Button asChild>
          <Link href="/candidato/testes">Voltar para Testes</Link>
        </Button>
      </div>
    );
  }

  // Determinar ícone e cor do resultado
  const getResultIcon = () => {
    switch (test.evaluationResult) {
      case EvaluationResult.APPROVED:
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case EvaluationResult.PARTIAL:
        return <MinusCircle className="h-16 w-16 text-yellow-500" />;
      default:
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getResultColor = () => {
    switch (test.evaluationResult) {
      case EvaluationResult.APPROVED:
        return "bg-green-50 border-green-200";
      case EvaluationResult.PARTIAL:
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-red-50 border-red-200";
    }
  };

  const getFeedbackMessage = () => {
    if (cachedResult?.feedbackMessage) {
      return cachedResult.feedbackMessage;
    }

    switch (test.evaluationResult) {
      case EvaluationResult.APPROVED:
        return `Parabéns! Você foi aprovado no teste de digitação. Sua velocidade de ${test.wpm} WPM e precisão de ${test.accuracy}% estão acima dos critérios mínimos exigidos.`;
      case EvaluationResult.PARTIAL:
        return `Você obteve um resultado parcial. Sua velocidade de ${test.wpm} WPM e precisão de ${test.accuracy}% estão próximos dos critérios mínimos. Recomendamos praticar mais.`;
      default:
        return `Infelizmente, você não atingiu os critérios mínimos. Sua velocidade foi de ${test.wpm} WPM e precisão de ${test.accuracy}%. Para aprovação, é necessário pelo menos 40 WPM e 95% de precisão.`;
    }
  };

  // Formatar duração
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} segundos`;
    return `${mins}min ${secs}s`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Voltar */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/candidato/testes">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Testes
        </Link>
      </Button>

      {/* Card de Resultado Principal */}
      <Card className={`border-2 ${getResultColor()}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {getResultIcon()}

            <div>
              <h1 className="text-2xl font-bold">
                {RESULT_LABELS[test.evaluationResult as EvaluationResult] ||
                  "Resultado"}
              </h1>
              <p className="text-muted-foreground">
                Teste de Digitação - {DIFFICULTY_LABELS[test.difficulty]}
              </p>
            </div>

            {test.candidateName && (
              <Badge variant="outline" className="text-base px-4 py-1">
                {test.candidateName}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Keyboard className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-bold">{test.wpm}</p>
            <p className="text-sm text-muted-foreground">WPM</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-3xl font-bold">{test.accuracy?.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Precisão</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-bold">{test.durationSeconds}</p>
            <p className="text-sm text-muted-foreground">Segundos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-3xl font-bold">{test.errors || 0}</p>
            <p className="text-sm text-muted-foreground">Erros</p>
          </CardContent>
        </Card>
      </div>

      {/* Percentil e comparação */}
      {cachedResult?.wpmPercentile && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Comparação com outros candidatos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Seu desempenho</span>
                <span className="font-medium">
                  Melhor que {cachedResult.wpmPercentile}% dos candidatos
                </span>
              </div>
              <Progress value={cachedResult.wpmPercentile} className="h-3" />
            </div>

            {cachedResult.isAboveAverage ? (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Seu WPM está acima da média!
              </p>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Continue praticando para melhorar seu resultado.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feedback */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{getFeedbackMessage()}</p>
        </CardContent>
      </Card>

      {/* Alertas de fraude */}
      {(test.pasteAttempts > 0 || test.focusLostCount > 3 || test.isSuspicious) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Alertas Registrados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {test.pasteAttempts > 0 && (
              <p className="text-sm text-yellow-700">
                • {test.pasteAttempts} tentativa(s) de colar texto
              </p>
            )}
            {test.focusLostCount > 0 && (
              <p className="text-sm text-yellow-700">
                • Janela perdeu foco {test.focusLostCount} vez(es)
              </p>
            )}
            {test.isSuspicious && (
              <p className="text-sm text-yellow-700 font-medium">
                • Este teste foi marcado para revisão
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detalhes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Detalhes do Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Data</dt>
              <dd className="font-medium">
                {test.completedAt
                  ? new Date(test.completedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Duração</dt>
              <dd className="font-medium">
                {formatDuration(test.durationSeconds || 0)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Dificuldade</dt>
              <dd className="font-medium">
                {DIFFICULTY_LABELS[test.difficulty]}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Caracteres digitados</dt>
              <dd className="font-medium">
                {test.typedText?.length || 0} caracteres
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/candidato/testes" className="flex-1">
          <Button className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Fazer Novo Teste
          </Button>
        </Link>

        <Button variant="outline" className="flex-1" disabled>
          <Download className="h-4 w-4 mr-2" />
          Baixar Certificado
        </Button>

        <Button variant="outline" className="flex-1" disabled>
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </div>
    </div>
  );
}
