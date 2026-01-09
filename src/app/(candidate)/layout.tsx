"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeProvider } from "@/components/theme-provider";
import { useCandidateStore } from "@/store/candidate";
import {
  LayoutDashboard,
  User,
  FileText,
  Kanban,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

const sidebarItems = [
  {
    name: "Dashboard",
    href: "/candidato/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Meu Perfil",
    href: "/candidato/perfil",
    icon: User,
  },
  {
    name: "Minhas Candidaturas",
    href: "/candidato/candidaturas",
    icon: FileText,
  },
  {
    name: "Rastreador",
    href: "/candidato/rastreador",
    icon: Kanban,
  },
  {
    name: "Notificacoes",
    href: "/candidato/notificacoes",
    icon: Bell,
  },
  {
    name: "Configuracoes",
    href: "/candidato/configuracoes",
    icon: Settings,
  },
];

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { profile, unreadNotificationsCount } = useCandidateStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    // Clear storage and redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem("candidate-storage");
    }
    router.push("/login");
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar - Desktop */}
          <aside
            className={cn(
              "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40",
              sidebarCollapsed ? "w-20" : "w-64"
            )}
          >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
              {!sidebarCollapsed && (
                <Link href="/candidato/dashboard" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ER</span>
                  </div>
                  <span className="font-semibold text-lg">Rheply</span>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
              <ul className="space-y-1 px-3">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <span className="font-medium">{item.name}</span>
                        )}
                        {item.name === "Notificacoes" && unreadNotificationsCount > 0 && (
                          <Badge
                            variant="destructive"
                            className={cn(
                              "ml-auto",
                              sidebarCollapsed && "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                            )}
                          >
                            {unreadNotificationsCount}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User Section */}
            {!sidebarCollapsed && (
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar} />
                    <AvatarFallback>
                      {profile?.firstName?.[0]}
                      {profile?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {profile?.firstName} {profile?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Mobile Navigation Drawer */}
          {isMobileNavOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setIsMobileNavOpen(false)}
              />
              <div className="fixed left-0 top-0 h-full w-72 bg-card border-r border-border p-4 animate-slide-in-from-left">
                <div className="flex items-center justify-between mb-6">
                  <Link href="/candidato/dashboard" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">ER</span>
                    </div>
                    <span className="font-semibold text-lg">Rheply</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav>
                  <ul className="space-y-1">
                    {sidebarItems.map((item) => {
                      const isActive =
                        pathname === item.href || pathname?.startsWith(item.href + "/");
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileNavOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.name}</span>
                            {item.name === "Notificacoes" && unreadNotificationsCount > 0 && (
                              <Badge variant="destructive" className="ml-auto">
                                {unreadNotificationsCount}
                              </Badge>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div
            className={cn(
              "flex-1 flex flex-col min-h-screen transition-all duration-300",
              sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
            )}
          >
            {/* Header */}
            <header className="sticky top-0 z-30 h-16 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
              <div className="flex items-center justify-between h-full px-4 sm:px-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setIsMobileNavOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>

                  <div className="hidden sm:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar vagas..."
                      className="bg-transparent border-none outline-none text-sm w-48"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative"
                    onClick={() => router.push("/candidato/notificacoes")}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotificationsCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {unreadNotificationsCount}
                      </Badge>
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar} />
                          <AvatarFallback>
                            {profile?.firstName?.[0]}
                            {profile?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {profile?.firstName} {profile?.lastName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {profile?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push("/candidato/perfil")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Meu Perfil</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/candidato/configuracoes")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configuracoes</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card/50 py-4 px-6">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
                <p>2024 Rheply. Todos os direitos reservados.</p>
                <div className="flex space-x-4 mt-2 sm:mt-0">
                  <Link
                    href="/privacidade"
                    className="hover:text-foreground transition-colors duration-300"
                  >
                    Privacidade
                  </Link>
                  <Link
                    href="/termos"
                    className="hover:text-foreground transition-colors duration-300"
                  >
                    Termos
                  </Link>
                  <Link
                    href="/suporte"
                    className="hover:text-foreground transition-colors duration-300"
                  >
                    Suporte
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
