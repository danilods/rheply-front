"use client";

import { useState } from "react";
import { Plus, CheckCircle, XCircle, Clock } from "lucide-react";

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: "UTILITY" | "MARKETING" | "AUTHENTICATION";
  language: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  content: string;
}

const MOCK_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "t1",
    name: "interview_invite_v1",
    category: "UTILITY",
    language: "pt_BR",
    status: "APPROVED",
    content: "Ola {{1}}, gostariamos de agendar uma entrevista para a vaga de {{2}}.",
  },
  {
    id: "t2",
    name: "application_received",
    category: "UTILITY",
    language: "pt_BR",
    status: "APPROVED",
    content: "Ola {{1}}, recebemos sua candidatura com sucesso!",
  },
  {
    id: "t3",
    name: "rejection_polite",
    category: "UTILITY",
    language: "pt_BR",
    status: "PENDING",
    content: "Ola {{1}}, obrigado pelo interesse, mas nao seguiremos neste momento.",
  },
];

export default function WhatsAppPage() {
  const [templates] = useState(MOCK_TEMPLATES);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Templates WhatsApp</h2>
          <p className="text-slate-400">Gerencie modelos aprovados pela Meta.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus size={16} />
          Novo Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
              <div>
                <h3 className="font-bold text-slate-200 text-sm mb-1">{template.name}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400">
                  {template.category}
                </span>
              </div>
              <div title={`Status: ${template.status}`}>
                {template.status === "APPROVED" && (
                  <CheckCircle size={18} className="text-emerald-500" />
                )}
                {template.status === "PENDING" && (
                  <Clock size={18} className="text-amber-500" />
                )}
                {template.status === "REJECTED" && (
                  <XCircle size={18} className="text-red-500" />
                )}
              </div>
            </div>

            <div
              className="p-4 flex-1 bg-slate-950"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              <div className="bg-slate-800 p-3 rounded-lg rounded-tl-none shadow-sm border border-slate-700 max-w-[90%] text-sm text-slate-200 leading-relaxed relative">
                {template.content}
                <span className="block text-[10px] text-slate-500 text-right mt-1">12:00</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-500 uppercase font-semibold">
                {template.language}
              </span>
              <button className="text-sm text-teal-400 font-medium hover:underline">
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
