"use client";

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  service: string;
  message: string;
  metadata?: string;
}

const MOCK_LOGS: LogEntry[] = [
  {
    id: "l1",
    timestamp: "2024-01-15 10:42:01",
    level: "INFO",
    service: "cv-parser",
    message: "Parsed CV for candidate c9283 successfully",
    metadata: "latency=450ms",
  },
  {
    id: "l2",
    timestamp: "2024-01-15 10:41:55",
    level: "WARN",
    service: "whatsapp-api",
    message: "Template mismatch detected",
    metadata: "template_id=t3",
  },
  {
    id: "l3",
    timestamp: "2024-01-15 10:40:12",
    level: "ERROR",
    service: "payment-gateway",
    message: "Transaction failed",
    metadata: "err_code=4002",
  },
  {
    id: "l4",
    timestamp: "2024-01-15 10:35:00",
    level: "INFO",
    service: "auth-service",
    message: "User login: admin@acme.com",
    metadata: "ip=192.168.1.1",
  },
];

export default function LogsPage() {
  const [logs] = useState(MOCK_LOGS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Logs do Sistema</h2>
          <p className="text-slate-400">Auditoria e troubleshooting (Tombstones).</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} />
          </button>
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-700 transition-colors">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800 flex flex-col font-mono text-sm">
        <div className="bg-slate-900 p-3 border-b border-slate-800 flex gap-4 text-xs text-slate-500 font-medium uppercase tracking-wider">
          <div className="w-40">Timestamp</div>
          <div className="w-20">Level</div>
          <div className="w-32">Service</div>
          <div className="flex-1">Message</div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex gap-4 p-1.5 hover:bg-slate-900 rounded transition-colors text-slate-300"
            >
              <div className="w-40 text-slate-500 shrink-0">{log.timestamp}</div>
              <div
                className={cn(
                  "w-20 font-bold shrink-0",
                  log.level === "ERROR" && "text-red-500",
                  log.level === "WARN" && "text-amber-500",
                  log.level === "INFO" && "text-blue-500"
                )}
              >
                {log.level}
              </div>
              <div className="w-32 text-emerald-500 shrink-0">{log.service}</div>
              <div className="flex-1 break-all">
                {log.message}
                {log.metadata && (
                  <span className="text-slate-600 ml-2 text-xs">[{log.metadata}]</span>
                )}
              </div>
            </div>
          ))}
          <div className="text-slate-600 italic p-2 text-xs animate-pulse">
            Waiting for new logs...
          </div>
        </div>
      </div>
    </div>
  );
}
