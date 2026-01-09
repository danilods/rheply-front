"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { JobAlert } from "@/types/lgpd";
import { Bell, Plus, Trash2, Edit2, Search } from "lucide-react";

interface JobAlertFormProps {
  initialAlerts?: JobAlert[];
  onSave?: (alerts: JobAlert[]) => void;
}

const jobTypes = [
  { value: "full_time", label: "Tempo Integral" },
  { value: "part_time", label: "Meio Período" },
  { value: "contract", label: "Contrato" },
  { value: "internship", label: "Estágio" },
  { value: "remote", label: "Remoto" },
];

const frequencies = [
  { value: "daily", label: "Diariamente" },
  { value: "weekly", label: "Semanalmente" },
];

const mockAlerts: JobAlert[] = [
  {
    id: "1",
    user_id: "user1",
    keywords: ["React", "Frontend", "TypeScript"],
    location: "São Paulo, SP",
    job_type: "full_time",
    salary_min: 8000,
    salary_max: 15000,
    frequency: "daily",
    is_active: true,
    created_at: "2024-10-15T10:00:00Z",
    last_sent_at: "2024-11-15T06:00:00Z",
  },
  {
    id: "2",
    user_id: "user1",
    keywords: ["Node.js", "Backend"],
    location: "Remoto",
    job_type: "remote",
    frequency: "weekly",
    is_active: false,
    created_at: "2024-11-01T14:30:00Z",
  },
];

export function JobAlertForm({ initialAlerts = mockAlerts, onSave }: JobAlertFormProps) {
  const [alerts, setAlerts] = useState<JobAlert[]>(initialAlerts);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");

  const resetForm = () => {
    setKeywords("");
    setLocation("");
    setJobType("");
    setSalaryMin("");
    setSalaryMax("");
    setFrequency("daily");
    setIsCreating(false);
    setEditingId(null);
  };

  const startEdit = (alert: JobAlert) => {
    setKeywords(alert.keywords.join(", "));
    setLocation(alert.location || "");
    setJobType(alert.job_type || "");
    setSalaryMin(alert.salary_min?.toString() || "");
    setSalaryMax(alert.salary_max?.toString() || "");
    setFrequency(alert.frequency);
    setEditingId(alert.id);
    setIsCreating(true);
  };

  const handleSaveAlert = async () => {
    if (!keywords.trim()) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma palavra-chave.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const alertData: JobAlert = {
        id: editingId || Date.now().toString(),
        user_id: "user1",
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        location: location || undefined,
        job_type: jobType || undefined,
        salary_min: salaryMin ? parseInt(salaryMin) : undefined,
        salary_max: salaryMax ? parseInt(salaryMax) : undefined,
        frequency,
        is_active: true,
        created_at: editingId
          ? alerts.find((a) => a.id === editingId)?.created_at || new Date().toISOString()
          : new Date().toISOString(),
      };

      let updatedAlerts: JobAlert[];
      if (editingId) {
        updatedAlerts = alerts.map((a) => (a.id === editingId ? alertData : a));
      } else {
        updatedAlerts = [...alerts, alertData];
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setAlerts(updatedAlerts);
      onSave?.(updatedAlerts);
      resetForm();

      toast({
        title: editingId ? "Alerta atualizado" : "Alerta criado",
        description: editingId
          ? "Seu alerta de vaga foi atualizado com sucesso."
          : "Você receberá notificações quando novas vagas combinarem com seus critérios.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o alerta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAlert = (alertId: string, isActive: boolean) => {
    const updatedAlerts = alerts.map((a) =>
      a.id === alertId ? { ...a, is_active: isActive } : a
    );
    setAlerts(updatedAlerts);
    onSave?.(updatedAlerts);

    toast({
      title: isActive ? "Alerta ativado" : "Alerta desativado",
      description: isActive
        ? "Você voltará a receber notificações deste alerta."
        : "Você não receberá mais notificações deste alerta.",
    });
  };

  const handleDeleteAlert = async (alertId: string) => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const updatedAlerts = alerts.filter((a) => a.id !== alertId);
      setAlerts(updatedAlerts);
      onSave?.(updatedAlerts);

      toast({
        title: "Alerta excluído",
        description: "O alerta de vaga foi removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o alerta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Alertas de Vagas
        </CardTitle>
        <CardDescription>
          Crie alertas personalizados e receba notificações quando novas vagas combinarem com
          seus critérios.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Seus Alertas</Label>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-muted/50"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {alert.keywords.join(", ")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {alert.location && (
                        <span className="bg-background px-2 py-1 rounded">
                          {alert.location}
                        </span>
                      )}
                      {alert.job_type && (
                        <span className="bg-background px-2 py-1 rounded">
                          {jobTypes.find((t) => t.value === alert.job_type)?.label}
                        </span>
                      )}
                      {(alert.salary_min || alert.salary_max) && (
                        <span className="bg-background px-2 py-1 rounded">
                          R$ {alert.salary_min?.toLocaleString() || "0"} - R${" "}
                          {alert.salary_max?.toLocaleString() || "∞"}
                        </span>
                      )}
                      <span className="bg-background px-2 py-1 rounded">
                        {frequencies.find((f) => f.value === alert.frequency)?.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(alert)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create/Edit Form */}
        {isCreating ? (
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {editingId ? "Editar Alerta" : "Novo Alerta"}
              </Label>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Cancelar
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Palavras-chave *</Label>
                <Input
                  id="keywords"
                  placeholder="React, Frontend, TypeScript (separar por vírgula)"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separe múltiplas palavras-chave por vírgula
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    placeholder="Ex: São Paulo, SP"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-type">Tipo de Vaga</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger id="job-type">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary-min">Salário Mínimo (R$)</Label>
                  <Input
                    id="salary-min"
                    type="number"
                    placeholder="Ex: 5000"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary-max">Salário Máximo (R$)</Label>
                  <Input
                    id="salary-max"
                    type="number"
                    placeholder="Ex: 15000"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência de Envio</Label>
                <Select
                  value={frequency}
                  onValueChange={(v) => setFrequency(v as "daily" | "weekly")}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveAlert} disabled={isLoading}>
                  {isLoading
                    ? "Salvando..."
                    : editingId
                    ? "Atualizar Alerta"
                    : "Criar Alerta"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4" />
            Criar Novo Alerta
          </Button>
        )}

        {/* Info */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-xs text-blue-800 dark:text-blue-200">
          <strong>Como funciona:</strong> Analisamos as novas vagas publicadas e enviamos
          notificações quando encontramos oportunidades que combinam com suas palavras-chave
          e critérios. Você pode ter até 5 alertas ativos.
        </div>
      </CardContent>
    </Card>
  );
}
