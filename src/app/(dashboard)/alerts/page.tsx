"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check, Trash2, AlertTriangle, Info, AlertOctagon } from "lucide-react";

interface Alert {
  id: string;
  type: "WARNING" | "INFO" | "CRITICAL";
  message: string;
  timestamp: string;
  read: boolean;
  context?: string;
}

const MOCK_ALERTS: Alert[] = [
  {
    id: "a1",
    type: "WARNING",
    message: "Candidato Bob Smith parado em Screening > 10 dias",
    timestamp: "2 horas atras",
    read: false,
    context: "/candidates/c2",
  },
  {
    id: "a2",
    type: "CRITICAL",
    message: "WhatsApp API Rate Limit Atingido",
    timestamp: "5 horas atras",
    read: false,
  },
  {
    id: "a3",
    type: "INFO",
    message: "Relatorio Semanal Disponivel",
    timestamp: "1 dia atras",
    read: true,
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  const getIcon = (type: string) => {
    switch (type) {
      case "CRITICAL":
        return <AlertOctagon className="text-red-500" />;
      case "WARNING":
        return <AlertTriangle className="text-amber-500" />;
      default:
        return <Info className="text-blue-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Alertas e Notificacoes</h2>
          <p className="text-slate-400">Acompanhe gargalos e problemas do sistema.</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-sm text-teal-400 hover:underline"
        >
          Marcar todos como lidos
        </button>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm divide-y divide-slate-800">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 flex gap-4 hover:bg-slate-800/50 transition-colors ${
              !alert.read ? "bg-teal-900/10" : ""
            }`}
          >
            <div className="mt-1">{getIcon(alert.type)}</div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3
                  className={`text-sm font-medium ${
                    !alert.read ? "text-white font-bold" : "text-slate-300"
                  }`}
                >
                  {alert.message}
                </h3>
                <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                  {alert.timestamp}
                </span>
              </div>

              {alert.context && (
                <Link
                  href={alert.context}
                  className="text-xs text-teal-400 hover:underline mt-1 inline-block"
                >
                  Ver detalhes
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => markAsRead(alert.id)}
                className="p-1.5 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md"
                title="Marcar como lido"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => deleteAlert(alert.id)}
                className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-md"
                title="Excluir"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="p-10 text-center text-slate-500">
            <Bell size={48} className="mx-auto mb-3 opacity-20" />
            <p>Nenhum alerta pendente. Bom trabalho!</p>
          </div>
        )}
      </div>
    </div>
  );
}
