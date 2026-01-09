"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  MessageCircle,
  Mail,
  ArrowRight,
  Tag,
  Code,
  Bell,
  FileText,
  CalendarPlus,
  Play,
  Plus,
  Trash2,
  GripVertical,
  Clock,
} from "lucide-react";
import type { Action, ActionOption } from "@/types/automation";

interface ActionBlockProps {
  actions: Action[];
  onAddAction: (action: Omit<Action, "id">) => void;
  onUpdateAction: (id: string, updates: Partial<Action>) => void;
  onRemoveAction: (id: string) => void;
  actionOptions: ActionOption[];
}

const iconMap: Record<string, React.ReactNode> = {
  MessageCircle: <MessageCircle className="h-4 w-4" />,
  Mail: <Mail className="h-4 w-4" />,
  ArrowRight: <ArrowRight className="h-4 w-4" />,
  Tag: <Tag className="h-4 w-4" />,
  Code: <Code className="h-4 w-4" />,
  Bell: <Bell className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  CalendarPlus: <CalendarPlus className="h-4 w-4" />,
};

export function ActionBlock({
  actions,
  onAddAction,
  onUpdateAction,
  onRemoveAction,
  actionOptions,
}: ActionBlockProps) {
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [params, setParams] = useState<Record<string, any>>({});
  const [delayMinutes, setDelayMinutes] = useState<number>(0);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    const option = actionOptions.find((a) => a.type === type);
    const newParams: Record<string, any> = {};
    option?.configFields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        newParams[field.name] = field.defaultValue;
      }
    });
    setParams(newParams);
    setDelayMinutes(0);
  };

  const handleSaveAction = () => {
    if (selectedType) {
      if (editingAction) {
        onUpdateAction(editingAction, {
          type: selectedType as Action["type"],
          params,
          delay_minutes: delayMinutes > 0 ? delayMinutes : undefined,
        });
      } else {
        onAddAction({
          type: selectedType as Action["type"],
          params,
          delay_minutes: delayMinutes > 0 ? delayMinutes : undefined,
        });
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedType("");
    setParams({});
    setDelayMinutes(0);
    setEditingAction(null);
    setShowAddSheet(false);
  };

  const handleEditAction = (action: Action) => {
    setEditingAction(action.id);
    setSelectedType(action.type);
    setParams(action.params);
    setDelayMinutes(action.delay_minutes || 0);
    setShowAddSheet(true);
  };

  const getActionLabel = (action: Action) => {
    const option = actionOptions.find((a) => a.type === action.type);
    if (!option) return action.type;

    let label = option.label;
    if (action.params.template) {
      label += `: ${action.params.template}`;
    } else if (action.params.stage_name) {
      label += `: ${action.params.stage_name}`;
    } else if (action.params.tag) {
      label += `: ${action.params.tag}`;
    } else if (action.params.test_type) {
      label += `: ${action.params.test_type}`;
    }
    return label;
  };

  const selectedOption = actionOptions.find((a) => a.type === selectedType);

  return (
    <>
      <Card className="border-purple-500/50 bg-purple-50/50 dark:bg-purple-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <Play className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">ENTAO (Acoes)</CardTitle>
              <CardDescription className="text-sm">
                {actions.length === 0
                  ? "Adicione acoes para executar"
                  : `${actions.length} acao(oes) configurada(s)`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddSheet(true)}
              className="shrink-0"
            >
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {actions.length === 0 && (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              Nenhuma acao configurada. Clique em &quot;Adicionar&quot; para comecar.
            </div>
          )}

          {actions.map((action) => {
            const option = actionOptions.find((a) => a.type === action.type);
            return (
              <div
                key={action.id}
                className="flex items-center gap-2 rounded-lg border bg-background p-3"
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
                  {option ? iconMap[option.icon] : <Play className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{getActionLabel(action)}</p>
                  {action.delay_minutes && action.delay_minutes > 0 && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Atraso: {action.delay_minutes} minutos
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditAction(action)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveAction(action.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Add/Edit Action Sheet */}
      <Sheet open={showAddSheet} onOpenChange={resetForm}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>
              {editingAction ? "Editar Acao" : "Adicionar Acao"}
            </SheetTitle>
            <SheetDescription>
              Configure o que acontece quando a automacao e acionada
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Action Type Selection */}
            <div className="space-y-2">
              <Label>Tipo de Acao</Label>
              <Select value={selectedType} onValueChange={handleTypeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma acao" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.type} value={option.type}>
                      <div className="flex items-center gap-2">
                        {iconMap[option.icon]}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedOption && (
                <p className="text-xs text-muted-foreground">
                  {selectedOption.description}
                </p>
              )}
            </div>

            {/* Action Parameters */}
            {selectedOption && selectedOption.configFields.length > 0 && (
              <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                <h4 className="font-medium">Parametros</h4>
                {selectedOption.configFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label}
                      {field.required && (
                        <span className="ml-1 text-destructive">*</span>
                      )}
                    </Label>
                    {field.type === "select" ? (
                      <Select
                        value={params[field.name] || ""}
                        onValueChange={(value) =>
                          setParams((prev) => ({ ...prev, [field.name]: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={params[field.name] || ""}
                        onChange={(e) =>
                          setParams((prev) => ({
                            ...prev,
                            [field.name]:
                              field.type === "number"
                                ? parseInt(e.target.value)
                                : e.target.value,
                          }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Delay Configuration */}
            {selectedType && (
              <div className="space-y-2">
                <Label htmlFor="delay">Atraso (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="delay"
                    type="number"
                    min="0"
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">minutos</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Defina 0 para executar imediatamente ou um valor para atrasar a
                  execucao
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button onClick={handleSaveAction} disabled={!selectedType}>
                {editingAction ? "Salvar Alteracoes" : "Adicionar Acao"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
