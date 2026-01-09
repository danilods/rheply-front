"use client"

import { CheckCircle, Zap, ArrowLeft } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import Link from "next/link"

// Configuração da empresa - pode ser alterado para cada cliente
const EMPRESA_CONFIG = {
  nome: "RHeply",  // Nome genérico - será configurável por empresa
  vaga: "Atendente Call Center",
}

export default function AplicacaoSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={36} showText={false} />
            <div>
              <h1 className="text-lg font-bold text-white">Processo Seletivo</h1>
              <p className="text-sm text-slate-400">{EMPRESA_CONFIG.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-full">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">{EMPRESA_CONFIG.vaga}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center">
          <div className="w-20 h-20 bg-emerald-900/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Cadastro Realizado com Sucesso!
          </h2>

          <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
            Seu teste de digitação foi enviado. Nossa equipe de RH analisará seu resultado e entrará em contato em breve.
          </p>

          <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700/50">
            <h3 className="text-white font-medium mb-3">Próximos Passos</h3>
            <ul className="text-slate-400 text-sm space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-teal-400 mt-1">1.</span>
                <span>Aguarde o contato da equipe de recrutamento por telefone ou WhatsApp</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 mt-1">2.</span>
                <span>Se aprovado(a), você será convidado(a) para a próxima etapa do processo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 mt-1">3.</span>
                <span>Mantenha seu telefone disponível para receber ligações</span>
              </li>
            </ul>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Início
          </Link>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Em caso de dúvidas, entre em contato com o RH.</p>
        </div>
      </main>
    </div>
  )
}
