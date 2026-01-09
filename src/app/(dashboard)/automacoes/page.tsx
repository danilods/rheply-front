"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Zap,
  UserPlus,
  RefreshCw,
  Calendar,
  Clock,
  Target,
  Code,
  Bell,
  Star,
  Award,
} from "lucide-react";
import { useAutomationsStore } from "@/store/automations";
import type { Automation, AutomationTemplate } from "@/types/automation";

// Mock data for demonstration
const mockAutomations: Automation[] = [
  {
    id: "1",
    company_id: "company-1",
    name: "Triagem Tech Automatica",
    description: "Envia teste tecnico para candidatos Tech com Python",
    trigger: { type: "application_received", params: {} },
    conditions: [
      { id: "c1", field: "job.department", operator: "equals", value: "Tech" },
      { id: "c2", field: "candidate.skills", operator: "contains", value: "Python", logic: "AND" },
    ],
    actions: [
      { id: "a1", type: "send_test", params: { test_type: "python", duration_hours: 48 } },
      { id: "a2", type: "move_stage", params: { stage_name: "Teste Tecnico" } },
    ],
    is_active: true,
    created_by: "user-1",
    created_at: "2024-03-10T10:00:00Z",
    updated_at: "2024-03-15T14:30:00Z",
    run_count: 45,
    last_run_at: "2024-03-16T09:15:00Z",
  },
  {
    id: "2",
    company_id: "company-1",
    name: "Resposta Rapida",
    description: "Envia confirmacao automatica de candidatura",
    trigger: { type: "application_received", params: {} },
    conditions: [],
    actions: [
      { id: "a1", type: "send_email", params: { template: "application_received", subject: "Recebemos sua candidatura!" }, delay_minutes: 60 },
    ],
    is_active: true,
    created_by: "user-1",
    created_at: "2024-03-08T11:00:00Z",
    updated_at: "2024-03-08T11:00:00Z",
    run_count: 128,
    last_run_at: "2024-03-16T10:45:00Z",
  },
  {
    id: "3",
    company_id: "company-1",
    name: "Alerta de Inatividade",
    description: "Notifica recrutador quando candidato fica parado",
    trigger: { type: "days_without_movement", params: { days: 10 } },
    conditions: [],
    actions: [
      { id: "a1", type: "notify_manager", params: { message: "Candidato sem movimentacao", channel: "email" } },
      { id: "a2", type: "add_tag", params: { tag: "atencao-necessaria" } },
    ],
    is_active: false,
    created_by: "user-1",
    created_at: "2024-03-05T09:00:00Z",
    updated_at: "2024-03-14T16:00:00Z",
    run_count: 12,
    last_run_at: "2024-03-14T08:00:00Z",
  },
];

const triggerIcons: Record<string, React.ReactNode> = {
  application_received: <UserPlus className="h-4 w-4" />,
  status_changed: <RefreshCw className="h-4 w-4" />,
  interview_scheduled: <Calendar className="h-4 w-4" />,
  days_without_movement: <Clock className="h-4 w-4" />,
  match_score_threshold: <Target className="h-4 w-4" />,
};

const triggerLabels: Record<string, string> = {
  application_received: "Candidatura Recebida",
  status_changed: "Status Alterado",
  interview_scheduled: "Entrevista Agendada",
  days_without_movement: "Dias Sem Movimentacao",
  match_score_threshold: "Score de Match",
};

const templateIcons: Record<string, React.ReactNode> = {
  Code: <Code className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  Bell: <Bell className="h-5 w-5" />,
  Star: <Star className="h-5 w-5" />,
  Calendar: <Calendar className="h-5 w-5" />,
  Award: <Award className="h-5 w-5" />,
};

export default function AutomacoesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [triggerFilter, setTriggerFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  const {
    automations,
    templates,
    fetchAutomations,
    fetchTemplates,
    toggleAutomation,
    deleteAutomation,
    cloneTemplate,
  } = useAutomationsStore();

  // Use mock data for now
  const displayAutomations = automations.length > 0 ? automations : mockAutomations;

  useEffect(() => {
    fetchAutomations();
    fetchTemplates();
  }, [fetchAutomations, fetchTemplates]);

  const filteredAutomations = displayAutomations.filter((automation) => {
    const matchesSearch =
      automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && automation.is_active) ||
      (statusFilter === "inactive" && !automation.is_active);
    const matchesTrigger =
      triggerFilter === "all" || automation.trigger.type === triggerFilter;

    return matchesSearch && matchesStatus && matchesTrigger;
  });

  const handleToggle = async (automation: Automation) => {
    await toggleAutomation(automation.id);
  };

  const handleDelete = async () => {
    if (selectedAutomation) {
      await deleteAutomation(selectedAutomation.id);
      setDeleteDialogOpen(false);
      setSelectedAutomation(null);
    }
  };

  const handleCloneTemplate = async (templateId: string) => {
    const result = await cloneTemplate(templateId);
    if (result) {
      router.push(`/automacoes/criar?edit=${result.id}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automacoes</h1>
          <p className="text-muted-foreground">
            Crie workflows automatizados para otimizar seu processo de recrutamento
          </p>
        </div>
        <Link href="/automacoes/criar">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar Automacao
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="automations" className="w-full">
        <TabsList>
          <TabsTrigger value="automations">Minhas Automacoes</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar automacoes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="inactive">Inativas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={triggerFilter} onValueChange={setTriggerFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Triggers</SelectItem>
                    <SelectItem value="application_received">Candidatura Recebida</SelectItem>
                    <SelectItem value="status_changed">Status Alterado</SelectItem>
                    <SelectItem value="interview_scheduled">Entrevista Agendada</SelectItem>
                    <SelectItem value="days_without_movement">Dias Sem Movimentacao</SelectItem>
                    <SelectItem value="match_score_threshold">Score de Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Automations List */}
          {filteredAutomations.length > 0 ? (
            <div className="grid gap-4">
              {filteredAutomations.map((automation) => (
                <Card key={automation.id}>
                  <CardContent className="flex items-center gap-4 p-6">
                    {/* Icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{automation.name}</h3>
                        <Badge variant={automation.is_active ? "default" : "secondary"}>
                          {automation.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {automation.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {triggerIcons[automation.trigger.type]}
                          {triggerLabels[automation.trigger.type]}
                        </span>
                        <span>|</span>
                        <span>{automation.run_count} execucoes</span>
                        <span>|</span>
                        <span>Ultima: {formatDate(automation.last_run_at)}</span>
                      </div>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {automation.is_active ? "Ativa" : "Inativa"}
                      </span>
                      <Switch
                        checked={automation.is_active}
                        onCheckedChange={() => handleToggle(automation)}
                      />
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/automacoes/criar?edit=${automation.id}`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedAutomation(automation);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma automacao encontrada</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== "all" || triggerFilter !== "all"
                    ? "Tente ajustar os filtros"
                    : "Crie sua primeira automacao para comecar"}
                </p>
                {!searchQuery && statusFilter === "all" && triggerFilter === "all" && (
                  <Link href="/automacoes/criar" className="mt-4 inline-block">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Automacao
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(templates.length > 0 ? templates : mockTemplates).map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {templateIcons[template.icon] || <Zap className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{template.description}</CardDescription>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Trigger:</span>
                      {triggerLabels[template.trigger.type]}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Condicoes:</span>
                      {template.conditions.length} configurada(s)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Acoes:</span>
                      {template.actions.length} configurada(s)
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleCloneTemplate(template.id)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Automacao</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a automacao &quot;{selectedAutomation?.name}&quot;?
              Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Mock templates for demonstration
const mockTemplates: AutomationTemplate[] = [
  {
    id: "tech_screening",
    name: "Triagem Tech Automatica",
    description: "Envia teste tecnico automaticamente para candidatos Tech com habilidades especificas",
    category: "tech",
    icon: "Code",
    trigger: { type: "application_received", params: {} },
    conditions: [
      { id: "c1", field: "job.department", operator: "equals", value: "Tech" },
      { id: "c2", field: "candidate.skills", operator: "contains", value: "Python", logic: "AND" },
    ],
    actions: [
      { id: "a1", type: "send_email", params: { template: "tech_test_invitation", subject: "Convite para Teste Tecnico" } },
      { id: "a2", type: "send_test", params: { test_type: "python", duration_hours: 48 } },
      { id: "a3", type: "move_stage", params: { stage_name: "Teste Tecnico" } },
    ],
  },
  {
    id: "fast_responder",
    name: "Resposta Rapida",
    description: "Envia confirmacao automatica em ate 1 hora apos receber candidatura",
    category: "communication",
    icon: "Zap",
    trigger: { type: "application_received", params: {} },
    conditions: [],
    actions: [
      { id: "a1", type: "send_email", params: { template: "application_received", subject: "Recebemos sua candidatura!" }, delay_minutes: 60 },
      { id: "a2", type: "add_note", params: { note: "Email de confirmacao enviado automaticamente" } },
    ],
  },
  {
    id: "stale_alert",
    name: "Alerta de Inatividade",
    description: "Notifica recrutador quando candidato fica 10 dias sem movimentacao",
    category: "monitoring",
    icon: "Bell",
    trigger: { type: "days_without_movement", params: { days: 10 } },
    conditions: [],
    actions: [
      { id: "a1", type: "notify_manager", params: { message: "Candidato sem movimentacao ha 10 dias", channel: "email" } },
      { id: "a2", type: "add_tag", params: { tag: "atencao-necessaria" } },
    ],
  },
  {
    id: "high_match_priority",
    name: "Prioridade Alto Match",
    description: "Prioriza candidatos com score de match acima de 85%",
    category: "scoring",
    icon: "Star",
    trigger: { type: "match_score_threshold", params: { min_score: 85 } },
    conditions: [],
    actions: [
      { id: "a1", type: "add_tag", params: { tag: "high-priority" } },
      { id: "a2", type: "notify_manager", params: { message: "Candidato com alto match (>85%) identificado", channel: "slack" } },
      { id: "a3", type: "send_whatsapp", params: { template: "interview_invitation" }, delay_minutes: 30 },
    ],
  },
  {
    id: "interview_followup",
    name: "Follow-up de Entrevista",
    description: "Envia lembrete e instrucoes quando entrevista e agendada",
    category: "scheduling",
    icon: "Calendar",
    trigger: { type: "interview_scheduled", params: {} },
    conditions: [],
    actions: [
      { id: "a1", type: "send_email", params: { template: "interview_confirmation", subject: "Confirmacao de Entrevista" } },
      { id: "a2", type: "send_whatsapp", params: { template: "interview_reminder" }, delay_minutes: 1440 },
      { id: "a3", type: "add_note", params: { note: "Entrevista agendada - notificacoes enviadas" } },
    ],
  },
  {
    id: "senior_candidate_screening",
    name: "Triagem Senior",
    description: "Processo especial para candidatos com 5+ anos de experiencia",
    category: "screening",
    icon: "Award",
    trigger: { type: "application_received", params: {} },
    conditions: [
      { id: "c1", field: "candidate.years_experience", operator: "greater_than_or_equal", value: 5 },
    ],
    actions: [
      { id: "a1", type: "add_tag", params: { tag: "senior-candidate" } },
      { id: "a2", type: "notify_manager", params: { message: "Candidato senior identificado - revisao prioritaria", channel: "slack" } },
    ],
  },
];
