"use client";

/**
 * Página de Execução de Teste - Onde o candidato realiza o teste de digitação.
 *
 * Esta página carrega os detalhes do teste, permite iniciar e executar
 * o teste de digitação, e redireciona para os resultados ao finalizar.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  Clock,
  Target,
  Keyboard,
  Info,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { typingTestApi } from "@/services/typing-test-api";
import { useTypingTestStore } from "@/store/typing-test-store";
import { TypingTest } from "@/components/tests/typing-test";
import {
  TypingTestDetail,
  TypingTestStartResponse,
  TestStatus,
  DIFFICULTY_LABELS,
  STATUS_LABELS,
} from "@/types/typing-test";

export default function TestePage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  // State
  const [isClient, setIsClient] = useState(false);
  const [test, setTest] = useState<TypingTestDetail | null>(null);
  const [startedTest, setStartedTest] = useState<TypingTestStartResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Store
  const { setResult } = useTypingTestStore();

  // Hydration protection
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carregar teste
  useEffect(() => {
    if (!isClient || !testId) return;

    const fetchTest = async () => {
      setIsLoading(true);
      try {
        const testData = await typingTestApi.getPublicTest(testId);
        setTest(testData);

        // Se já iniciado, pré-carregar dados
        if (testData.status === TestStatus.IN_PROGRESS) {
          setStartedTest({
            id: testData.id,
            textSample: testData.textSample,
            difficulty: testData.difficulty,
            status: testData.status,
            startedAt: testData.startedAt || new Date().toISOString(),
          });
          setShowInstructions(false);
        }

        // Se já concluído, redirecionar para resultados
        if (testData.status === TestStatus.COMPLETED) {
          router.push(`/candidato/testes/${testId}/resultados`);
        }
      } catch (err) {
        console.error("Erro ao carregar teste:", err);
        setError("Não foi possível carregar o teste. Verifique o link e tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [isClient, testId, router]);

  // Iniciar teste
  const handleStartTest = useCallback(async () => {
    if (!testId) return;

    setIsStarting(true);
    try {
      const started = await typingTestApi.startPublicTest(testId);
      setStartedTest(started);
      setShowInstructions(false);
    } catch (err) {
      console.error("Erro ao iniciar teste:", err);
      setError("Não foi possível iniciar o teste. Tente novamente.");
    } finally {
      setIsStarting(false);
    }
  }, [testId]);

  // Submeter teste
  const handleSubmitTest = useCallback(
    async (data: {
      typedText: string;
      durationSeconds: number;
      pasteAttempts: number;
      focusLostCount: number;
    }) => {
      if (!testId) return;

      setIsSubmitting(true);
      try {
        const result = await typingTestApi.submitPublicTest(testId, {
          typedText: data.typedText,
          durationSeconds: data.durationSeconds,
          pasteAttempts: data.pasteAttempts,
          focusLostCount: data.focusLostCount,
        });

        // Salva resultado no store
        setResult(result);

        // Redireciona para página de resultados
        router.push(`/candidato/testes/${testId}/resultados`);
      } catch (err) {
        console.error("Erro ao submeter teste:", err);
        setError("Não foi possível enviar os resultados. Tente novamente.");
        setIsSubmitting(false);
      }
    },
    [testId, router, setResult]
  );

  // Cancelar teste
  const handleCancelTest = useCallback(async () => {
    router.push("/candidato/testes");
  }, [router]);

  // Loading state
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error && !test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Erro ao carregar teste</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button asChild>
          <Link href="/candidato/testes">Voltar para Testes</Link>
        </Button>
      </div>
    );
  }

  // Test not found
  if (!test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Teste não encontrado</h2>
        <p className="text-muted-foreground">
          O teste solicitado não existe ou foi removido.
        </p>
        <Button asChild>
          <Link href="/candidato/testes">Voltar para Testes</Link>
        </Button>
      </div>
    );
  }

  // Instructions view
  if (showInstructions && !startedTest) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/candidato/testes">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-6 w-6" />
              Teste de Digitação
            </CardTitle>
            <CardDescription>
              Dificuldade: {DIFFICULTY_LABELS[test.difficulty]}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações do candidato */}
            {test.candidateName && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Candidato</p>
                <p className="font-medium">{test.candidateName}</p>
                {test.candidateCpf && (
                  <p className="text-sm text-muted-foreground">
                    CPF: {test.candidateCpf}
                  </p>
                )}
              </div>
            )}

            {/* Instruções */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Info className="h-5 w-5" />
                Instruções
              </h3>

              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Um texto será exibido na tela. Digite-o o mais rápido e
                    precisamente possível.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    O cronômetro iniciará automaticamente quando você começar a
                    digitar.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Erros serão destacados em vermelho. Tente manter alta
                    precisão.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    4
                  </span>
                  <span>
                    <strong>Não é permitido</strong> copiar e colar texto.
                    Tentativas serão registradas.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    5
                  </span>
                  <span>
                    Mantenha a janela em foco. Perdas de foco serão registradas.
                  </span>
                </li>
              </ul>
            </div>

            {/* Critérios de aprovação */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <h4 className="font-medium text-blue-900">
                Critérios de Aprovação
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>
                    <strong>WPM mínimo:</strong> 40 palavras/min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span>
                    <strong>Precisão mínima:</strong> 95%
                  </span>
                </div>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Botão iniciar */}
            <Button
              onClick={handleStartTest}
              disabled={isStarting}
              className="w-full"
              size="lg"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Preparando teste...
                </>
              ) : (
                <>
                  <Keyboard className="h-4 w-4 mr-2" />
                  Iniciar Teste
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Test execution view
  if (startedTest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Teste de Digitação</h1>
            <p className="text-muted-foreground">
              {test.candidateName} -{" "}
              {DIFFICULTY_LABELS[startedTest.difficulty]}
            </p>
          </div>
          <Badge variant="outline">{STATUS_LABELS[startedTest.status]}</Badge>
        </div>

        {/* Erro */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              Fechar
            </Button>
          </div>
        )}

        {/* Submitting overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-lg font-medium">Enviando resultados...</p>
            </div>
          </div>
        )}

        {/* Componente do teste */}
        <TypingTest
          testData={startedTest}
          onComplete={handleSubmitTest}
          onCancel={handleCancelTest}
        />
      </div>
    );
  }

  return null;
}
