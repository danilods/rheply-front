"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrackedJob } from "@/store/candidate";
import { Plus, GripVertical, ExternalLink, Trash2, Edit, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type ColumnType = TrackedJob["column"];

const columns: { id: ColumnType; title: string; color: string }[] = [
  { id: "interessado", title: "Interessado", color: "bg-slate-500" },
  { id: "aplicado", title: "Aplicado", color: "bg-blue-500" },
  { id: "entrevista", title: "Entrevista", color: "bg-yellow-500" },
  { id: "proposta", title: "Proposta", color: "bg-green-500" },
  { id: "rejeitado", title: "Rejeitado", color: "bg-red-500" },
];

interface KanbanBoardProps {
  jobs: TrackedJob[];
  onAddJob: (job: TrackedJob) => void;
  onUpdateJob: (id: string, updates: Partial<TrackedJob>) => void;
  onDeleteJob: (id: string) => void;
  onMoveJob: (id: string, column: ColumnType) => void;
}

export function KanbanBoard({
  jobs,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  onMoveJob,
}: KanbanBoardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<TrackedJob | null>(null);
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnType | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    url: "",
    source: "",
    notes: "",
    salary: "",
    location: "",
    column: "interessado" as ColumnType,
  });

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    setDraggedJobId(jobId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: ColumnType) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: ColumnType) => {
    e.preventDefault();
    if (draggedJobId) {
      onMoveJob(draggedJobId, columnId);
    }
    setDraggedJobId(null);
    setDragOverColumn(null);
  };

  const handleSubmit = () => {
    if (editingJob) {
      onUpdateJob(editingJob.id, formData);
    } else {
      const newJob: TrackedJob = {
        id: crypto.randomUUID(),
        ...formData,
        dateAdded: new Date().toISOString(),
      };
      onAddJob(newJob);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      url: "",
      source: "",
      notes: "",
      salary: "",
      location: "",
      column: "interessado",
    });
    setEditingJob(null);
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (job: TrackedJob) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      url: job.url || "",
      source: job.source,
      notes: job.notes || "",
      salary: job.salary || "",
      location: job.location || "",
      column: job.column,
    });
    setIsAddDialogOpen(true);
  };

  const getJobsByColumn = (columnId: ColumnType) => {
    return jobs.filter((job) => job.column === columnId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meu Rastreador de Vagas</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Vaga
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map((column) => {
          const columnJobs = getJobsByColumn(column.id);
          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={cn(
                "min-h-[500px] rounded-lg border-2 border-dashed transition-colors",
                dragOverColumn === column.id
                  ? "border-primary bg-primary/5"
                  : "border-transparent"
              )}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", column.color)} />
                      {column.title}
                    </div>
                    <Badge variant="secondary">{columnJobs.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {columnJobs.map((job) => (
                    <div
                      key={job.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id)}
                      className={cn(
                        "bg-card border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group",
                        draggedJobId === job.id && "opacity-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{job.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {job.company}
                          </p>
                        </div>
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>

                      <div className="mt-2 space-y-1">
                        {job.location && (
                          <p className="text-xs text-muted-foreground">{job.location}</p>
                        )}
                        {job.salary && (
                          <p className="text-xs font-medium text-green-600">{job.salary}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(job.dateAdded), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </div>
                        {job.source && (
                          <Badge variant="outline" className="text-xs">
                            {job.source}
                          </Badge>
                        )}
                      </div>

                      {job.notes && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {job.notes}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {job.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => window.open(job.url, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => openEditDialog(job)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-destructive hover:text-destructive"
                          onClick={() => onDeleteJob(job.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {columnJobs.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                      Arraste vagas aqui
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Job Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingJob ? "Editar Vaga" : "Adicionar Vaga Externa"}
            </DialogTitle>
            <DialogDescription>
              Acompanhe vagas de qualquer fonte em um so lugar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo da Vaga *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Ex: Desenvolvedor Full Stack"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, company: e.target.value }))
                }
                placeholder="Nome da empresa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Fonte *</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, source: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Gupy">Gupy</SelectItem>
                    <SelectItem value="Indeed">Indeed</SelectItem>
                    <SelectItem value="Glassdoor">Glassdoor</SelectItem>
                    <SelectItem value="Catho">Catho</SelectItem>
                    <SelectItem value="InfoJobs">InfoJobs</SelectItem>
                    <SelectItem value="Site da Empresa">Site da Empresa</SelectItem>
                    <SelectItem value="Indicacao">Indicacao</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="column">Status</Label>
                <Select
                  value={formData.column}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, column: value as ColumnType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Link da Vaga</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Localizacao</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="Ex: Remoto, Sao Paulo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salario</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, salary: e.target.value }))
                  }
                  placeholder="Ex: R$ 8.000 - 12.000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Anotacoes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Suas anotacoes sobre a vaga..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.company || !formData.source}
            >
              {editingJob ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
