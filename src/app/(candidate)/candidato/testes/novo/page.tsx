"use client";

/**
 * Página de Novo Teste - Formulário de pré-registro + teste de digitação.
 *
 * Esta página guia o candidato através do processo completo:
 * 1. Preencher formulário de pré-cadastro
 * 2. Realizar o teste de digitação
 * 3. Ver os resultados
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, Keyboard } from "lucide-react";
import { PreRegistrationFormComponent } from "@/components/tests/pre-registration-form";
import { typingTestApi } from "@/services/typing-test-api";
import { PreRegistrationForm, TestDifficulty } from "@/types/typing-test";

export default function NovoTestePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handler para submissão do formulário
  const handleSubmit = useCallback(
    async (data: PreRegistrationForm) => {
      setIsLoading(true);
      setError(null);

      try {
        // Cria o teste com os dados do pré-registro
        const test = await typingTestApi.createPublicTest({
          difficulty: data.testDifficulty || TestDifficulty.MEDIUM,
          candidateName: data.nomeCompleto,
          candidateCpf: data.cpf,
          candidateEmail: data.email,
          candidatePhone: data.telefone,
        });

        // Redireciona para a página do teste
        router.push(`/candidato/testes/${test.id}`);
      } catch (err) {
        console.error("Erro ao criar teste:", err);
        setError(
          "Não foi possível criar o teste. Verifique os dados e tente novamente."
        );
        setIsLoading(false);
      }
    },
    [router]
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/candidato/testes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Título */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Keyboard className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Teste de Digitação</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Preencha seus dados para iniciar o teste. Suas informações serão
          tratadas com confidencialidade conforme a LGPD.
        </p>
      </div>

      {/* Erro */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 max-w-2xl mx-auto">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
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

      {/* Formulário de Pré-Registro */}
      <PreRegistrationFormComponent
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
