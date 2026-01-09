"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Loader2,
} from "lucide-react";

interface AutomationPreviewProps {
  automationId?: string;
  onTest: (sampleData: Record<string, any>) => Promise<any>;
  isTesting: boolean;
}

const defaultSampleData = {
  job: {
    id: "job-123",
    title: "Senior Python Developer",
    department: "Tech",
    location: "Remote",
    employment_type: "full_time",
  },
  candidate: {
    id: "candidate-456",
    name: "Maria Silva",
    email: "maria@example.com",
    phone: "+55 11 99999-9999",
    skills: ["Python", "Django", "FastAPI", "PostgreSQL"],
    years_experience: 6,
    location: "Sao Paulo",
    languages: ["Portugues", "Ingles"],
  },
  application: {
    id: "app-789",
    match_score: 87,
    status: "new",
    applied_at: "2024-03-15T10:30:00Z",
  },
};

export function AutomationPreview({
  automationId,
  onTest,
  isTesting,
}: AutomationPreviewProps) {
  const [sampleData, setSampleData] = useState<string>(
    JSON.stringify(defaultSampleData, null, 2)
  );
  const [testResult, setTestResult] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleTest = async () => {
    try {
      const data = JSON.parse(sampleData);
      setParseError(null);
      const result = await onTest(data);
      setTestResult(result);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setParseError("JSON invalido. Verifique a sintaxe.");
      } else {
        setParseError("Erro ao testar automacao.");
      }
    }
  };

  const loadTemplate = (type: string) => {
    const templates: Record<string, any> = {
      tech: {
        job: {
          id: "job-tech-001",
          title: "Senior Python Developer",
          department: "Tech",
          location: "Remote",
          employment_type: "full_time",
        },
        candidate: {
          id: "cand-tech-001",
          name: "Carlos Oliveira",
          email: "carlos@tech.com",
          phone: "+55 11 98888-8888",
          skills: ["Python", "Django", "React", "AWS"],
          years_experience: 5,
          location: "Sao Paulo",
          languages: ["Portugues", "Ingles"],
        },
        application: {
          id: "app-tech-001",
          match_score: 92,
          status: "analyzing",
          applied_at: new Date().toISOString(),
        },
      },
      marketing: {
        job: {
          id: "job-mkt-001",
          title: "Marketing Manager",
          department: "Marketing",
          location: "Sao Paulo",
          employment_type: "full_time",
        },
        candidate: {
          id: "cand-mkt-001",
          name: "Ana Costa",
          email: "ana@marketing.com",
          phone: "+55 21 97777-7777",
          skills: ["Digital Marketing", "SEO", "Google Ads"],
          years_experience: 3,
          location: "Rio de Janeiro",
          languages: ["Portugues", "Espanhol"],
        },
        application: {
          id: "app-mkt-001",
          match_score: 75,
          status: "new",
          applied_at: new Date().toISOString(),
        },
      },
      junior: {
        job: {
          id: "job-jr-001",
          title: "Junior Frontend Developer",
          department: "Tech",
          location: "Hibrido",
          employment_type: "full_time",
        },
        candidate: {
          id: "cand-jr-001",
          name: "Pedro Santos",
          email: "pedro@junior.com",
          phone: "+55 31 96666-6666",
          skills: ["JavaScript", "React", "CSS"],
          years_experience: 1,
          location: "Belo Horizonte",
          languages: ["Portugues"],
        },
        application: {
          id: "app-jr-001",
          match_score: 68,
          status: "new",
          applied_at: new Date().toISOString(),
        },
      },
    };

    setSampleData(JSON.stringify(templates[type], null, 2));
    setTestResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Testar Automacao</CardTitle>
        <CardDescription>
          Teste sua automacao com dados de exemplo para ver como ela se comporta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Dados de Teste</TabsTrigger>
            <TabsTrigger value="result">Resultado</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadTemplate("tech")}
              >
                Candidato Tech
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadTemplate("marketing")}
              >
                Candidato Marketing
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadTemplate("junior")}
              >
                Candidato Junior
              </Button>
            </div>

            <div className="space-y-2">
              <Textarea
                value={sampleData}
                onChange={(e) => {
                  setSampleData(e.target.value);
                  setParseError(null);
                }}
                className="h-64 font-mono text-xs"
                placeholder="Cole aqui os dados JSON para teste"
              />
              {parseError && (
                <p className="text-sm text-destructive">{parseError}</p>
              )}
            </div>

            <Button
              onClick={handleTest}
              disabled={isTesting || !automationId}
              className="w-full"
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Executar Teste (Dry Run)
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="result" className="space-y-4">
            {!testResult && (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Execute um teste para ver os resultados aqui
                </p>
              </div>
            )}

            {testResult && (
              <div className="space-y-4">
                {/* Overall Status */}
                <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
                  {testResult.all_conditions_passed ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">
                        Todas as condicoes foram atendidas
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="font-medium">
                        Condicoes nao foram atendidas
                      </span>
                    </>
                  )}
                </div>

                {/* Conditions Evaluation */}
                {testResult.conditions_evaluation?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Avaliacao das Condicoes</h4>
                    {testResult.conditions_evaluation.map(
                      (condition: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 rounded border p-3"
                        >
                          {condition.passed ? (
                            <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">
                                {condition.field}
                              </span>{" "}
                              {condition.operator}{" "}
                              <span className="font-mono">
                                {JSON.stringify(condition.expected_value)}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Valor atual:{" "}
                              <span className="font-mono">
                                {JSON.stringify(condition.actual_value)}
                              </span>
                            </p>
                          </div>
                          <Badge
                            variant={condition.passed ? "default" : "destructive"}
                          >
                            {condition.passed ? "Passou" : "Falhou"}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Actions Preview */}
                {testResult.actions_preview?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Acoes que Seriam Executadas</h4>
                    {testResult.actions_preview.map(
                      (action: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 rounded border p-3"
                        >
                          {action.would_execute ? (
                            <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{action.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {JSON.stringify(action.params)}
                            </p>
                            {action.delay_minutes > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Atraso: {action.delay_minutes} minutos
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={
                              action.would_execute ? "default" : "secondary"
                            }
                          >
                            {action.would_execute ? "Executaria" : "Nao Executaria"}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
