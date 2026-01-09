"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationTimeline } from "@/components/candidate/application-timeline";
import { useCandidateStore, CandidateApplication } from "@/store/candidate";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  FileText,
  MessageSquare,
  ExternalLink,
  CalendarPlus,
  Target,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  enviada: {
    label: "Enviada",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    nextSteps: "Aguarde enquanto a empresa analisa seu curriculo. Isso pode levar alguns dias.",
  },
  em_analise: {
    label: "Em Analise",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    nextSteps: "Seu curriculo esta sendo avaliado. Mantenha seu perfil atualizado enquanto aguarda.",
  },
  entrevista: {
    label: "Entrevista",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    nextSteps: "Prepare-se para a entrevista! Pesquise sobre a empresa e pratique perguntas comuns.",
  },
  proposta: {
    label: "Proposta",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    nextSteps: "Parabens! Analise a proposta com cuidado e entre em contato para tirar duvidas.",
  },
  rejeitada: {
    label: "Rejeitada",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    nextSteps: "Nao desanime! Use o feedback para melhorar e continue se candidatando.",
  },
  contratada: {
    label: "Contratada",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    nextSteps: "Parabens pela conquista! Prepare-se para o inicio da sua nova jornada.",
  },
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { applications } = useCandidateStore();
  const [application, setApplication] = useState<CandidateApplication | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  useEffect(() => {
    setIsClient(true);
    if (applications.length > 0 && params.id) {
      const found = applications.find((app) => app.id === params.id);
      if (found) {
        setApplication(found);
      }
    }
  }, [applications, params.id]);

  const handleAddToCalendar = () => {
    if (!application?.interviewDetails) return;

    const eventDate = new Date(application.interviewDetails.date);
    const [hours, minutes] = application.interviewDetails.time.split(":").map(Number);
    eventDate.setHours(hours, minutes);

    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 1);

    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, "");
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `Entrevista - ${application.company}`
    )}&dates=${formatDateForCalendar(eventDate)}/${formatDateForCalendar(
      endDate
    )}&details=${encodeURIComponent(
      `Entrevista para ${application.jobTitle}`
    )}&location=${encodeURIComponent(
      application.interviewDetails.meetingUrl || ""
    )}`;

    window.open(calendarUrl, "_blank");
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "phone":
        return <Phone className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  const getInterviewTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Videoconferencia";
      case "phone":
        return "Telefone";
      default:
        return "Presencial";
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Candidatura nao encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              A candidatura que voce procura nao existe ou foi removida.
            </p>
            <Button asChild>
              <Link href="/candidato/candidaturas">Ver todas candidaturas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Job Info Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{application.jobTitle}</h1>
                <Badge
                  className={cn(
                    "font-medium",
                    statusConfig[application.status].color
                  )}
                >
                  {statusConfig[application.status].label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{application.company}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Aplicado em{" "}
                  {format(new Date(application.appliedAt), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Atualizado{" "}
                  {formatDistanceToNow(new Date(application.updatedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Match Score: {application.matchScore}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline da Candidatura</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationTimeline
                steps={application.timeline}
                orientation="vertical"
              />
            </CardContent>
          </Card>

          {/* Interview Details */}
          {application.status === "entrevista" && application.interviewDetails && (
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-purple-50 dark:bg-purple-950/20">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <Calendar className="h-5 w-5" />
                  Detalhes da Entrevista
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Data e Hora
                    </p>
                    <p className="font-semibold mt-1">
                      {format(
                        new Date(application.interviewDetails.date),
                        "EEEE, dd MMMM yyyy",
                        { locale: ptBR }
                      )}
                    </p>
                    <p className="font-semibold">
                      {application.interviewDetails.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tipo
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getInterviewTypeIcon(application.interviewDetails.type)}
                      <span className="font-semibold">
                        {getInterviewTypeLabel(application.interviewDetails.type)}
                      </span>
                    </div>
                  </div>
                </div>

                {application.interviewDetails.meetingUrl && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Link da Reuniao
                    </p>
                    <a
                      href={application.interviewDetails.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      {application.interviewDetails.meetingUrl}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}

                {application.interviewDetails.location && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Local
                    </p>
                    <p className="font-semibold mt-1">
                      {application.interviewDetails.location}
                    </p>
                  </div>
                )}

                <Separator />

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleAddToCalendar}>
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Adicionar ao Calendario
                  </Button>
                  {application.interviewDetails.meetingUrl && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(
                          application.interviewDetails?.meetingUrl,
                          "_blank"
                        )
                      }
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Entrar na Reuniao
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback Section */}
          {application.status === "rejeitada" && application.feedback && (
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <Lightbulb className="h-5 w-5" />
                  Feedback da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed">
                  {application.feedback}
                </p>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    Sugestoes para melhorar:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      - Considere adicionar mais projetos relacionados ao perfil da
                      vaga
                    </li>
                    <li>
                      - Destaque experiencias que demonstrem as habilidades
                      solicitadas
                    </li>
                    <li>
                      - Personalize sua carta de apresentacao para cada candidatura
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat with Recruiter */}
          {["entrevista", "proposta", "em_analise"].includes(
            application.status
          ) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat com Recrutador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="min-h-[200px] bg-muted/30 rounded-lg p-4">
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Nenhuma mensagem ainda. Inicie uma conversa com o recrutador.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button disabled={!chatMessage.trim()}>Enviar Mensagem</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Proximos Passos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {statusConfig[application.status].nextSteps}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Documents Sent */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documentos Enviados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {application.documents.map((doc) => (
                  <div
                    key={doc}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{doc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acoes Rapidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/candidato/perfil">
                  <FileText className="h-4 w-4 mr-2" />
                  Atualizar Curriculo
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/vagas">
                  <Target className="h-4 w-4 mr-2" />
                  Buscar Mais Vagas
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/candidato/rastreador">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Rastreador
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
