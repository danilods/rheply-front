"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const FUNNEL_DATA = [
  { name: "Candidaturas", value: 1200, fill: "#94a3b8" },
  { name: "Triagem", value: 800, fill: "#64748b" },
  { name: "Entrevista", value: 400, fill: "#0ea5a4" },
  { name: "Proposta", value: 100, fill: "#3b82f6" },
  { name: "Contratados", value: 85, fill: "#10b981" },
];

const SOURCE_DATA = [
  { name: "LinkedIn", value: 45, fill: "#0077b5" },
  { name: "Indicacao", value: 25, fill: "#0ea5a4" },
  { name: "Site Carreiras", value: 20, fill: "#cbd5e1" },
  { name: "Agencias", value: 10, fill: "#475569" },
];

type DateRange = "7d" | "30d" | "90d";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics de RH</h2>
          <p className="text-slate-400">Metricas de performance em tempo real (ClickHouse).</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
            {(["7d", "30d", "90d"] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  dateRange === range
                    ? "bg-teal-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors">
            <Calendar size={16} /> Personalizado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Custo por Contratacao (CPH)</h3>
          <p className="text-3xl font-bold text-white mt-2">R$ 1.250</p>
          <span className="text-xs text-emerald-400 font-medium">-5% vs mes anterior</span>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Score Anti-Buraco Negro</h3>
          <p className="text-3xl font-bold text-white mt-2">92/100</p>
          <p className="text-xs text-slate-500 mt-1">Taxa de resposta aos candidatos</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Ofertas Aceitas</h3>
          <p className="text-3xl font-bold text-white mt-2">85%</p>
          <span className="text-xs text-emerald-400 font-medium">+2% vs mes anterior</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Funnel */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-2">Funil de Recrutamento</h3>
          <p className="text-sm text-slate-400 mb-6">Conversao entre etapas do processo.</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={FUNNEL_DATA}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#334155"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#1e293b" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #334155",
                    backgroundColor: "#1e293b",
                    color: "#fff",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.5)",
                  }}
                />
                <Bar dataKey="value" barSize={32} radius={[0, 4, 4, 0]}>
                  {FUNNEL_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Efficiency */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-2">Eficiencia por Canal</h3>
          <p className="text-sm text-slate-400 mb-6">Origem dos candidatos contratados.</p>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SOURCE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {SOURCE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #334155",
                    backgroundColor: "#1e293b",
                    color: "#fff",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
