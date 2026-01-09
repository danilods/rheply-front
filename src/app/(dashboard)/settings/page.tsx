"use client";

import { useState } from "react";
import { Globe, Key, Shield, Users, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "geral" | "seguranca" | "equipe" | "integracoes";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("geral");
  const [require2FA, setRequire2FA] = useState(true);
  const [manualApproval, setManualApproval] = useState(false);

  const tabs = [
    { id: "geral" as TabType, label: "Geral" },
    { id: "seguranca" as TabType, label: "Seguranca & API" },
    { id: "equipe" as TabType, label: "Equipe" },
    { id: "integracoes" as TabType, label: "Integracoes" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Configuracoes</h2>
        <p className="text-slate-400">
          Gerencie seguranca, integracoes e preferencias da empresa.
        </p>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-4 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-teal-400 border-b-2 border-teal-400 bg-teal-500/5"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-8">
          {activeTab === "geral" && (
            <>
              {/* Branding Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe size={20} className="text-slate-400" /> Branding da Pagina de Carreiras
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      defaultValue="Acme Corp"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Subdominio
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        defaultValue="acme"
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-l-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                      />
                      <span className="bg-slate-700 border border-l-0 border-slate-700 text-slate-400 px-3 py-2 rounded-r-lg text-sm">
                        .rheply.com
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === "seguranca" && (
            <>
              {/* API Keys Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Key size={20} className="text-slate-400" /> Chaves de API
                </h3>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-slate-300">
                      Production API Key
                    </label>
                    <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value="sk_live_51M..."
                      readOnly
                      className="flex-1 bg-slate-900 px-3 py-2 border border-slate-700 rounded-lg text-sm text-slate-500 font-mono"
                    />
                    <button className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors">
                      Regenerate
                    </button>
                  </div>
                </div>
              </section>

              <hr className="border-slate-800" />

              {/* Toggles */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield size={20} className="text-slate-400" /> Permissoes & Regras
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-200">Exigir 2FA para Recrutadores</p>
                      <p className="text-xs text-slate-500">
                        Aumente a seguranca do acesso ao painel.
                      </p>
                    </div>
                    <button
                      onClick={() => setRequire2FA(!require2FA)}
                      className={cn(
                        "w-11 h-6 rounded-full relative cursor-pointer transition-colors",
                        require2FA ? "bg-teal-500" : "bg-slate-600"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all",
                          require2FA ? "right-1" : "left-1"
                        )}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-200">Aprovacao Manual de Vagas</p>
                      <p className="text-xs text-slate-500">
                        Admins precisam aprovar vagas antes de publicar.
                      </p>
                    </div>
                    <button
                      onClick={() => setManualApproval(!manualApproval)}
                      className={cn(
                        "w-11 h-6 rounded-full relative cursor-pointer transition-colors",
                        manualApproval ? "bg-teal-500" : "bg-slate-600"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all",
                          manualApproval ? "right-1" : "left-1"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === "equipe" && (
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-slate-400" /> Membros da Equipe
              </h3>
              <p className="text-slate-400 text-sm">
                Gerencie os membros da sua equipe e suas permissoes.
              </p>
              <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
                <Users size={48} className="mx-auto mb-3 text-slate-600" />
                <p className="text-slate-500">Funcionalidade em desenvolvimento</p>
              </div>
            </section>
          )}

          {activeTab === "integracoes" && (
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plug size={20} className="text-slate-400" /> Integracoes
              </h3>
              <p className="text-slate-400 text-sm">
                Conecte ferramentas externas ao seu pipeline de recrutamento.
              </p>
              <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
                <Plug size={48} className="mx-auto mb-3 text-slate-600" />
                <p className="text-slate-500">Funcionalidade em desenvolvimento</p>
              </div>
            </section>
          )}
        </div>

        <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex justify-end gap-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
            Salvar Alteracoes
          </button>
        </div>
      </div>
    </div>
  );
}
