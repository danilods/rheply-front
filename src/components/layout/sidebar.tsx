"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Kanban,
  MessageSquare,
  Settings,
  PieChart,
  Bell,
  Zap,
  CreditCard,
  Terminal,
  LogOut,
  ClipboardCheck,
  Globe,
  Keyboard,
  Rocket,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { useAuthStore } from "@/store/auth";

const menuGroups = [
  {
    title: "Visao Geral",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", path: "/analytics", icon: PieChart },
    ],
  },
  {
    title: "Recrutamento",
    items: [
      { label: "Selecao", path: "/selecao", icon: ClipboardCheck },
      { label: "Avaliacoes", path: "/dashboard/avaliacoes", icon: Keyboard },
      { label: "Vagas", path: "/jobs", icon: Briefcase },
      { label: "Pipeline", path: "/pipeline", icon: Kanban },
      { label: "Base de Talentos", path: "/candidates", icon: Users },
    ],
  },
  {
    title: "Operacoes",
    items: [
      { label: "WhatsApp", path: "/whatsapp", icon: MessageSquare },
      { label: "Automacao", path: "/automacoes", icon: Zap },
      { label: "Alertas", path: "/alerts", icon: Bell },
    ],
  },
  {
    title: "Sistema",
    items: [
      { label: "Faturamento", path: "/billing", icon: CreditCard },
      { label: "Logs", path: "/logs", icon: Terminal },
    ],
  },
  {
    title: "Acesso Publico (Demo)",
    items: [
      { label: "Landing Page (Mkt)", path: "/", icon: Rocket },
      { label: "Portal de Vagas", path: "/vagas", icon: Globe },
      { label: "Teste Digitacao", path: "/processo-seletivo/teste-digitacao/demo-id", icon: Keyboard },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse?.(newState);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-slate-900 text-slate-300 h-screen sticky top-0 border-r border-slate-800 transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("p-6", isCollapsed && "p-4 flex justify-center")}>
        <Link href="/dashboard">
          <Logo size={36} showText={!isCollapsed} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-6 custom-scrollbar">
        {menuGroups.map((group, index) => (
          <div key={index}>
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.path ||
                  (item.path !== "/dashboard" && pathname.startsWith(item.path));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-sm",
                      isActive
                        ? "bg-teal-500/10 text-teal-400 font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                        : "hover:bg-slate-800 hover:text-white",
                      isCollapsed && "justify-center"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        isActive
                          ? "text-teal-400"
                          : "text-slate-400 group-hover:text-white"
                      )}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div className="mt-auto px-3 py-2 space-y-1 border-t border-slate-800 pt-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm",
            pathname === "/settings"
              ? "bg-teal-500/10 text-teal-400 font-medium"
              : "hover:bg-slate-800 hover:text-white",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Configuracoes" : undefined}
        >
          <Settings
            size={18}
            className={cn(
              pathname === "/settings"
                ? "text-teal-400"
                : "text-slate-400 group-hover:text-white"
            )}
          />
          {!isCollapsed && <span>Configuracoes</span>}
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4">
        <div
          className={cn(
            "flex items-center gap-3 px-2 py-2 bg-slate-800/50 rounded-xl border border-slate-800",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className={cn("flex items-center gap-3", isCollapsed && "hidden")}>
            <div className="w-8 h-8 rounded-full border border-slate-600 bg-slate-700 flex items-center justify-center overflow-hidden">
              {user?.fullName ? (
                <span className="text-xs font-bold text-white">
                  {user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              ) : (
                <span className="text-xs font-bold text-white">AD</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">
                {user?.fullName || "Admin"}
              </span>
              <span className="text-[10px] text-slate-500">
                {user?.companyName || "Acme Corp"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-white transition-colors"
            title="Sair"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Collapse Button */}
      <div className="border-t border-slate-800 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCollapse}
          className="w-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors duration-300"
          aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
