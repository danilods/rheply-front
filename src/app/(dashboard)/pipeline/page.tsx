"use client";

import { useState } from "react";
import { MoreHorizontal, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

enum CandidateStatus {
  Applied = "APPLIED",
  Screening = "SCREENING",
  Interview = "INTERVIEW",
  Offer = "OFFER",
  Hired = "HIRED",
}

interface Candidate {
  id: string;
  name: string;
  role: string;
  status: CandidateStatus;
  daysInStage: number;
  matchScore: number;
  avatarUrl: string;
}

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "Alice Freeman",
    role: "Senior Frontend Engineer",
    status: CandidateStatus.Interview,
    daysInStage: 3,
    matchScore: 92,
    avatarUrl: "https://picsum.photos/id/64/200/200",
  },
  {
    id: "c2",
    name: "Bob Smith",
    role: "Product Manager",
    status: CandidateStatus.Screening,
    daysInStage: 12,
    matchScore: 78,
    avatarUrl: "https://picsum.photos/id/65/200/200",
  },
  {
    id: "c3",
    name: "Charlie Davis",
    role: "Backend Developer",
    status: CandidateStatus.Applied,
    daysInStage: 1,
    matchScore: 65,
    avatarUrl: "https://picsum.photos/id/66/200/200",
  },
  {
    id: "c4",
    name: "Diana Prince",
    role: "Senior Frontend Engineer",
    status: CandidateStatus.Offer,
    daysInStage: 2,
    matchScore: 98,
    avatarUrl: "https://picsum.photos/id/67/200/200",
  },
  {
    id: "c5",
    name: "Evan Wright",
    role: "DevOps Engineer",
    status: CandidateStatus.Screening,
    daysInStage: 5,
    matchScore: 85,
    avatarUrl: "https://picsum.photos/id/68/200/200",
  },
];

export default function PipelinePage() {
  const [candidates] = useState<Candidate[]>(MOCK_CANDIDATES);

  const columns = [
    {
      id: CandidateStatus.Applied,
      title: "Aplicado",
      count: candidates.filter((c) => c.status === CandidateStatus.Applied).length,
    },
    {
      id: CandidateStatus.Screening,
      title: "Screening",
      count: candidates.filter((c) => c.status === CandidateStatus.Screening).length,
    },
    {
      id: CandidateStatus.Interview,
      title: "Entrevista",
      count: candidates.filter((c) => c.status === CandidateStatus.Interview).length,
    },
    {
      id: CandidateStatus.Offer,
      title: "Proposta",
      count: candidates.filter((c) => c.status === CandidateStatus.Offer).length,
    },
    {
      id: CandidateStatus.Hired,
      title: "Contratado",
      count: candidates.filter((c) => c.status === CandidateStatus.Hired).length,
    },
  ];

  const getColumnColor = (status: CandidateStatus) => {
    switch (status) {
      case CandidateStatus.Hired:
        return "bg-emerald-500";
      case CandidateStatus.Offer:
        return "bg-blue-500";
      default:
        return "bg-slate-600";
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Pipeline</h2>
          <p className="text-slate-400">Gerencie o fluxo de candidatos.</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50">
            <option>Todos os Jobs</option>
            <option>Senior Frontend Engineer</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1000px] h-full">
          {columns.map((col) => (
            <div
              key={col.id}
              className="flex-1 min-w-[280px] bg-slate-900 rounded-xl flex flex-col border border-slate-800"
            >
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <div
                    className={cn("w-2 h-2 rounded-full", getColumnColor(col.id as CandidateStatus))}
                  />
                  <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wide">
                    {col.title}
                  </h3>
                  <span className="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 text-xs font-medium text-slate-400">
                    {col.count}
                  </span>
                </div>
                <button className="text-slate-500 hover:text-slate-300">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* Drop Area */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                {candidates
                  .filter((c) => c.status === col.id)
                  .map((candidate) => (
                    <div
                      key={candidate.id}
                      className={cn(
                        "bg-slate-800 p-4 rounded-xl border shadow-sm hover:shadow-md hover:bg-slate-750 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden group",
                        candidate.daysInStage > 10
                          ? "border-red-900/60 ring-1 ring-red-900/30"
                          : "border-slate-700"
                      )}
                    >
                      {/* 10 Day Rule Alert */}
                      {candidate.daysInStage > 10 && (
                        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                          ! PARADO
                        </div>
                      )}

                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={candidate.avatarUrl}
                          alt={candidate.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-600"
                        />
                        <div>
                          <h4 className="font-semibold text-slate-200 text-sm leading-tight">
                            {candidate.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">{candidate.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700">
                        <div
                          className="flex items-center gap-1 text-xs text-slate-500"
                          title="AI Match Score"
                        >
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                          <span className="font-medium text-slate-400">
                            {candidate.matchScore}%
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            candidate.daysInStage > 10 ? "text-red-400" : "text-slate-500"
                          )}
                        >
                          <Clock size={12} />
                          <span>{candidate.daysInStage}d</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
