"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileCompletion } from "@/components/candidate/profile-completion";
import { useCandidateStore } from "@/store/candidate";
import {
  Send,
  Eye,
  Calendar,
  Target,
  Upload,
  Search,
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CandidateDashboardPage() {
  const {
    profile,
    stats,
    recommendedJobs,
    notifications,
    setProfile,
    setStats,
    setRecommendedJobs,
    setNotifications,
    getProfileCompletionPercentage,
    getMissingProfileItems,
  } = useCandidateStore();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Initialize with demo data if empty
    if (!profile) {
      setProfile({
        id: "demo-user",
        firstName: "Maria",
        lastName: "Silva",
        email: "maria.silva@email.com",
        phone: "(11) 99999-9999",
        headline: "Desenvolvedora Full Stack",
        location: "Sao Paulo, SP",
        avatar: "",
        summary:
          "Desenvolvedora apaixonada por criar solucoes web modernas e eficientes.",
        isProfileVisible: true,
        linkedInConnected: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (stats.applicationsSent === 0) {
      setStats({
        applicationsSent: 12,
        profileViews: 47,
        interviewInvitations: 3,
        averageMatchScore: 78,
      });
    }

    if (recommendedJobs.length === 0) {
      setRecommendedJobs([
        {
          id: "1",
          title: "Desenvolvedor Full Stack Senior",
          company: "Tech Solutions",
          location: "Remoto",
          salary: "R$ 12.000 - 18.000",
          matchScore: 92,
          postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
        },
        {
          id: "2",
          title: "Frontend Developer",
          company: "StartupXYZ",
          location: "Sao Paulo, SP",
          salary: "R$ 8.000 - 12.000",
          matchScore: 85,
          postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          skills: ["React", "Next.js", "Tailwind CSS"],
        },
        {
          id: "3",
          title: "Software Engineer",
          company: "Global Corp",
          location: "Hibrido - Sao Paulo",
          salary: "R$ 15.000 - 20.000",
          matchScore: 79,
          postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          skills: ["JavaScript", "Python", "AWS", "Docker"],
        },
      ]);
    }

    if (notifications.length === 0) {
      setNotifications([
        {
          id: "1",
          type: "interview_scheduled",
          title: "Entrevista Agendada",
          message: "Sua entrevista com Tech Solutions foi confirmada para amanha as 14h.",
          read: false,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          actionUrl: "/candidato/candidaturas/1",
        },
        {
          id: "2",
          type: "profile_view",
          title: "Perfil Visualizado",
          message: "Um recrutador da StartupXYZ visualizou seu perfil.",
          read: false,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          type: "application_update",
          title: "Candidatura Atualizada",
          message: "Sua candidatura para Frontend Developer passou para proxima fase.",
          read: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          actionUrl: "/candidato/candidaturas/2",
        },
      ]);
    }
  }, [
    profile,
    stats,
    recommendedJobs,
    notifications,
    setProfile,
    setStats,
    setRecommendedJobs,
    setNotifications,
  ]);

  if (!isClient || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const missingItems = getMissingProfileItems();
  const completionPercentage = getProfileCompletionPercentage();

  const recentActivity = [
    {
      id: "1",
      type: "application",
      title: "Candidatura enviada",
      description: "Desenvolvedor Full Stack - Tech Solutions",
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: Send,
      color: "text-blue-500",
    },
    {
      id: "2",
      type: "view",
      title: "Perfil visualizado",
      description: "Recrutador da StartupXYZ",
      time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      icon: Eye,
      color: "text-green-500",
    },
    {
      id: "3",
      type: "interview",
      title: "Entrevista agendada",
      description: "Tech Solutions - 14h amanha",
      time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      icon: Calendar,
      color: "text-purple-500",
    },
    {
      id: "4",
      type: "update",
      title: "Status atualizado",
      description: "Frontend Developer - Em Analise",
      time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      icon: CheckCircle2,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ola, {profile.firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Veja como esta sua busca por emprego hoje.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/candidato/perfil">
              <Upload className="h-4 w-4 mr-2" />
              Atualizar CV
            </Link>
          </Button>
          <Link href="/vagas">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Buscar Vagas
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {completionPercentage < 100 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="font-medium">
                    Seu perfil esta {completionPercentage}% completo
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Perfis completos recebem 3x mais visualizacoes!
                  </p>
                </div>
              </div>
              <Button size="sm" asChild>
                <Link href="/candidato/perfil">Completar Perfil</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Candidaturas Enviadas
                </p>
                <p className="text-3xl font-bold mt-2">{stats.applicationsSent}</p>
              </div>
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Visualizacoes do Perfil
                </p>
                <p className="text-3xl font-bold mt-2">{stats.profileViews}</p>
              </div>
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Convites de Entrevista
                </p>
                <p className="text-3xl font-bold mt-2">{stats.interviewInvitations}</p>
              </div>
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Match Score Medio
                </p>
                <p className="text-3xl font-bold mt-2">{stats.averageMatchScore}%</p>
              </div>
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-3">
                <Target className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Vagas Recomendadas para Voce
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vagas">
                Ver todas
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {recommendedJobs.map((job) => (
              <Card
                key={job.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        <Badge
                          variant={job.matchScore >= 85 ? "default" : "secondary"}
                          className={cn(
                            job.matchScore >= 85 && "bg-green-500 hover:bg-green-600"
                          )}
                        >
                          {job.matchScore}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {job.company}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        {job.salary && (
                          <span className="font-medium text-green-600">
                            {job.salary}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {job.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(job.postedAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                      <Button size="sm" className="mt-2">
                        Candidatar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <ProfileCompletion showDetails={false} />

          {/* Pending Actions */}
          {missingItems.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Acoes Pendentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {missingItems.slice(0, 3).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <span className="text-sm">{item}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/candidato/perfil">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "rounded-full p-2 bg-muted",
                        activity.color
                      )}
                    >
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.time), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
