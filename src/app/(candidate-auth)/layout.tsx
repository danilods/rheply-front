"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Shield, Users, Zap } from "lucide-react";
import { useCandidateAuthStore } from "@/store/candidate-auth";

export default function CandidateAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, registrationSteps } = useCandidateAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/candidato/dashboard");
    }
  }, [isAuthenticated, router]);

  const isRegistration = pathname?.includes("/cadastro");

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header with Logo */}
        <div className="p-6 border-b">
          <Link href="/" className="inline-block">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">
                Rheply
              </span>
            </div>
          </Link>
        </div>

        {/* Progress indicator for registration */}
        {isRegistration && (
          <div className="px-8 py-4 border-b bg-muted/30">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                        registrationSteps.currentStep >= step
                          ? registrationSteps.completedSteps.includes(step)
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-primary border-primary text-white"
                          : "bg-background border-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {registrationSteps.completedSteps.includes(step) ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="font-semibold">{step}</span>
                      )}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-24 h-1 mx-2 rounded transition-all duration-300 ${
                          registrationSteps.completedSteps.includes(step)
                            ? "bg-green-500"
                            : registrationSteps.currentStep > step
                            ? "bg-primary"
                            : "bg-muted-foreground/20"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  Dados Basicos
                </span>
                <span className="text-xs text-muted-foreground ml-6">
                  Curriculo
                </span>
                <span className="text-xs text-muted-foreground">
                  Preferencias
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">{children}</div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-center text-xs text-muted-foreground">
          <p>
            2024 Rheply. Todos os direitos reservados.{" "}
            <Link
              href="/politica-privacidade"
              className="text-primary hover:underline"
            >
              Privacidade
            </Link>{" "}
            |{" "}
            <Link href="/termos-uso" className="text-primary hover:underline">
              Termos
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Benefits (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[450px] bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-12 border-l">
        <div className="max-w-sm space-y-8">
          {/* Main Message */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Encontre sua proxima oportunidade
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Cadastre-se gratuitamente e conecte-se com as melhores empresas do
              mercado.
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Analise automatica de CV
                </h3>
                <p className="text-sm text-muted-foreground">
                  Nossa IA extrai suas informacoes automaticamente, economizando
                  seu tempo.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Match inteligente
                </h3>
                <p className="text-sm text-muted-foreground">
                  Receba sugestoes de vagas que combinam com seu perfil e
                  interesses.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Acompanhamento em tempo real
                </h3>
                <p className="text-sm text-muted-foreground">
                  Veja o status de todas suas candidaturas em um so lugar.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">5.000+</div>
              <div className="text-xs text-muted-foreground">
                Vagas disponiveis
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">98%</div>
              <div className="text-xs text-muted-foreground">Satisfacao</div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center space-x-4 pt-4">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 text-green-600" />
              <span>100% Gratuito</span>
            </div>
            <div className="h-4 w-px bg-muted-foreground/30" />
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span>LGPD Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
