"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Logo header on mobile/tablet */}
        <div className="lg:hidden p-6">
          <Logo size={40} textClassName="text-foreground" />
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-slate-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-transparent to-blue-500/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="max-w-lg text-center space-y-10 relative z-10">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo size={80} showText={false} />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white tracking-tight">
              RHeply
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Plataforma inteligente de recrutamento e selecao para empresas modernas
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-8">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-teal-400">500+</div>
              <div className="text-sm text-slate-400">Empresas</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-teal-400">10k+</div>
              <div className="text-sm text-slate-400">Candidatos</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-teal-400">95%</div>
              <div className="text-sm text-slate-400">Satisfacao</div>
            </div>
          </div>

          {/* Features list */}
          <div className="pt-8 space-y-4 text-left">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-2 h-2 bg-teal-400 rounded-full" />
              <span>Testes de digitacao e avaliacao automatica</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-2 h-2 bg-teal-400 rounded-full" />
              <span>Integracao com WhatsApp Business</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-2 h-2 bg-teal-400 rounded-full" />
              <span>Pipeline visual de candidatos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
