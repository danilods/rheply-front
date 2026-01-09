"use client";

import { CreditCard, CheckCircle, Download, Shield } from "lucide-react";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending";
  pdfUrl: string;
}

const MOCK_INVOICES: Invoice[] = [
  { id: "INV-2024-001", date: "Jan 01, 2024", amount: 299.0, status: "Paid", pdfUrl: "#" },
  { id: "INV-2023-012", date: "Dec 01, 2023", amount: 299.0, status: "Paid", pdfUrl: "#" },
  { id: "INV-2023-011", date: "Nov 01, 2023", amount: 299.0, status: "Paid", pdfUrl: "#" },
];

export default function BillingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Faturamento & Plano</h2>
        <p className="text-slate-400">Gerencie sua assinatura e metodos de pagamento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Plan Card */}
        <div className="md:col-span-2 bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Shield size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                Plano Atual
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-2">Growth Plan</h3>
            <p className="text-slate-400 mb-8 max-w-sm">
              Perfeito para empresas em expansao com ate 10 vagas ativas simultaneas.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <div className="text-sm text-slate-500">Vagas Ativas</div>
                <div className="text-xl font-bold">8 / 10</div>
                <div className="w-full h-1 bg-slate-700 rounded-full mt-2">
                  <div className="w-[80%] h-full bg-emerald-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Membros</div>
                <div className="text-xl font-bold">4 / 5</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="px-5 py-2.5 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-colors">
                Gerenciar Assinatura
              </button>
              <button className="px-5 py-2.5 bg-transparent border border-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                Alterar Plano
              </button>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-slate-400" /> Metodo de Pagamento
            </h3>
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div className="w-10 h-6 bg-slate-700 rounded flex items-center justify-center text-white text-[10px] font-bold">
                VISA
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-200">**** 4242</p>
                <p className="text-xs text-slate-500">Expira em 12/25</p>
              </div>
              <CheckCircle size={16} className="text-emerald-500" />
            </div>
          </div>
          <button className="w-full mt-4 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            Atualizar Cartao
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-800">
          <h3 className="font-bold text-white">Historico de Faturas</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-500">Data</th>
              <th className="px-6 py-3 font-medium text-slate-500">Valor</th>
              <th className="px-6 py-3 font-medium text-slate-500">Status</th>
              <th className="px-6 py-3 text-right font-medium text-slate-500">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {MOCK_INVOICES.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 text-slate-200">{inv.date}</td>
                <td className="px-6 py-4 text-slate-200">R$ {inv.amount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400">
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-500 hover:text-white flex items-center gap-1 ml-auto transition-colors">
                    <Download size={14} /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
