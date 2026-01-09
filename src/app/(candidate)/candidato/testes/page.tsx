"use client";

/**
 * Página de Listagem de Testes - Lista os testes de digitação do candidato.
 *
 * Exibe uma lista de testes disponíveis, em andamento e concluídos,
 * com opção de iniciar novos testes ou ver resultados anteriores.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Keyboard,
  Plus,
  Target,
  TrendingUp,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { typingTestApi } from "@/services/typing-test-api";
import { useTypingTestStore } from "@/store/typing-test-store";
import {
  TestDifficulty,
  TestStatus,
  DIFFICULTY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  RESULT_LABELS,
  RESULT_COLORS,
  EvaluationResult,
} from "@/types/typing-test";

export default function TestesPage() {
  const router = useRouter();
  const { tests, setTests, setLoading, isLoading, error, setError } =
    useTypingTestStore();

  // State local
  const [isClient, setIsClient] = useState(false);
  const [showNewTestDialog, setShowNewTestDialog] = useState(false);
  const [newTestDifficulty, setNewTestDifficulty] = useState<TestDifficulty>(
    TestDifficulty.MEDIUM
  );
  const [candidateName, setCandidateName] = useState("");
  const [candidateCpf, setCandidateCpf] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Hydration protection
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carregar testes ao montar
  useEffect(() => {
    if (!isClient) return;

    const fetchTests = async () => {
      setLoading(true);
      try {
        const response = await typingTestApi.listAllTests({ pageSize: 50 });
        setTests(response.items);
      } catch (err) {
        console.error("Erro ao carregar testes:", err);
        setError("Não foi possível carregar os testes. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [isClient, setTests, setLoading, setError]);

  // Handler para criar novo teste
  const handleCreateTest = async () => {
    if (!candidateName || !candidateCpf) {
      setError("Preencha nome e CPF para continuar.");
      return;
    }

    setIsCreating(true);
    try {
      const test = await typingTestApi.createPublicTest({
        difficulty: newTestDifficulty,
        candidateName,
        candidateCpf,
      });

      // Redireciona para a página do teste
      router.push(`/candidato/testes/${test.id}`);
    } catch (err) {
      console.error("Erro ao criar teste:", err);
      setError("Não foi possível criar o teste. Tente novamente.");
    } finally {
      setIsCreating(false);
    }
  };

  // Format CPF
  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Estatísticas rápidas
  const completedTests = tests.filter((t) => t.status === TestStatus.COMPLETED);
  const avgWpm =
    completedTests.length > 0
      ? completedTests.reduce((sum, t) => sum + (t.wpm || 0), 0) /
        completedTests.length
      : 0;
  const avgAccuracy =
    completedTests.length > 0
      ? completedTests.reduce((sum, t) => sum + (t.accuracy || 0), 0) /
        completedTests.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testes de Digitação</h1>
          <p className="text-muted-foreground">
            Avalie suas habilidades de digitação
          </p>
        </div>

        <Link href="/candidato/testes/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Teste
          </Button>
        </Link>

        {/* Dialog antigo mantido para referência - será removido após validação */}
        <Dialog open={showNewTestDialog} onOpenChange={setShowNewTestDialog}>
          <DialogTrigger asChild className="hidden">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Teste (Legacy)
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Iniciar Novo Teste</DialogTitle>
              <DialogDescription>
                Preencha seus dados e escolha a dificuldade do teste.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={candidateCpf}
                  onChange={(e) => setCandidateCpf(formatCpf(e.target.value))}
                  maxLength={14}
                />
              </div>

              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select
                  value={newTestDifficulty}
                  onValueChange={(v) => setNewTestDifficulty(v as TestDifficulty)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TestDifficulty.EASY}>
                      Fácil - Textos curtos e simples
                    </SelectItem>
                    <SelectItem value={TestDifficulty.MEDIUM}>
                      Médio - Textos moderados
                    </SelectItem>
                    <SelectItem value={TestDifficulty.HARD}>
                      Difícil - Textos longos e complexos
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNewTestDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateTest} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Iniciar Teste"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Keyboard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Testes</p>
              <p className="text-2xl font-bold">{tests.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Concluídos</p>
              <p className="text-2xl font-bold">{completedTests.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média WPM</p>
              <p className="text-2xl font-bold">{Math.round(avgWpm)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média Precisão</p>
              <p className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Testes */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Testes</CardTitle>
          <CardDescription>
            Seus testes de digitação anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : tests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Keyboard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Nenhum teste realizado</h3>
              <p className="text-muted-foreground mb-4">
                Clique em &quot;Novo Teste&quot; para começar sua avaliação.
              </p>
              <Link href="/candidato/testes/novo">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Iniciar Primeiro Teste
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => (
                <Link
                  key={test.id}
                  href={
                    test.status === TestStatus.COMPLETED
                      ? `/candidato/testes/${test.id}/resultados`
                      : `/candidato/testes/${test.id}`
                  }
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <Keyboard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Teste de Digitação -{" "}
                          {DIFFICULTY_LABELS[test.difficulty]}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(test.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {test.status === TestStatus.COMPLETED && (
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            {test.wpm} WPM
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            {test.accuracy?.toFixed(1)}%
                          </span>
                        </div>
                      )}

                      <Badge className={STATUS_COLORS[test.status]}>
                        {STATUS_LABELS[test.status]}
                      </Badge>

                      {test.evaluationResult && (
                        <Badge
                          className={
                            RESULT_COLORS[test.evaluationResult as EvaluationResult]
                          }
                        >
                          {RESULT_LABELS[test.evaluationResult as EvaluationResult]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
