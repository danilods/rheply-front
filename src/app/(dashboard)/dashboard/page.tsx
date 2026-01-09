"use client";

import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Users, Clock, Briefcase, TrendingUp, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const ANALYTICS_DATA = [
  { name: "Seg", hired: 2, applied: 10 },
  { name: "Ter", hired: 1, applied: 15 },
  { name: "Qua", hired: 3, applied: 20 },
  { name: "Qui", hired: 4, applied: 18 },
  { name: "Sex", hired: 2, applied: 25 },
  { name: "Sab", hired: 0, applied: 5 },
  { name: "Dom", hired: 0, applied: 2 },
];

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: React.ElementType;
  alert?: boolean;
}

function StatCard({ title, value, trend, icon: Icon, alert }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-slate-900 p-6 rounded-2xl border shadow-sm flex items-start justify-between",
        alert ? "border-red-900/50 bg-red-900/10" : "border-slate-800"
      )}
    >
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        {trend && (
          <p className="text-xs font-medium text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp size={12} /> {trend} vs mes anterior
          </p>
        )}
      </div>
      <div
        className={cn(
          "p-3 rounded-xl",
          alert ? "bg-red-500/10 text-red-500" : "bg-slate-800 text-slate-400"
        )}
      >
        <Icon size={24} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Geral</h2>
          <p className="text-slate-400">Visao geral de recrutamento e performance.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">
            Exportar
          </button>
          <Link
            href="/jobs/create"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Nova Vaga
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Candidatos Totais" value="1,234" trend="+12%" icon={Users} />
        <StatCard title="Time-to-Hire Medio" value="18 dias" trend="-2 dias" icon={Clock} />
        <StatCard title="Vagas Ativas" value="8" icon={Briefcase} />
        <StatCard title="Risco de Churn (10d+)" value="5" icon={AlertCircle} alert={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Chart */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-6">Fluxo de Candidatos</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ANALYTICS_DATA}>
                <defs>
                  <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5a4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5a4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #334155",
                    backgroundColor: "#1e293b",
                    color: "#fff",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.5)",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="applied"
                  stroke="#0ea5a4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorApplied)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hired Chart */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-6">Contratacoes Semanais</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#334155" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #334155",
                    backgroundColor: "#1e293b",
                    color: "#fff",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.5)",
                  }}
                />
                <Bar dataKey="hired" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Alertas Recentes</h3>
        </div>
        <div className="divide-y divide-slate-800">
          {[
            {
              title: "Candidato parado ha 10 dias",
              desc: 'Bob Smith no processo "Product Manager"',
              time: "2 horas atras",
            },
            {
              title: "Candidato parado ha 12 dias",
              desc: 'Maria Santos no processo "Backend Developer"',
              time: "5 horas atras",
            },
            {
              title: "Nova candidatura recebida",
              desc: 'Carlos Lima aplicou para "Senior Frontend"',
              time: "1 dia atras",
            },
          ].map((alert, i) => (
            <div
              key={i}
              className="p-4 flex items-center gap-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-orange-900/30 flex items-center justify-center text-orange-500 shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">{alert.title}</p>
                <p className="text-sm text-slate-500">{alert.desc}</p>
              </div>
              <span className="text-xs text-slate-500">{alert.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
