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
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import type { Condition, ConditionField, ConditionLogic, ConditionOperator } from "@/types/automation";

interface ConditionBlockProps {
  conditions: Condition[];
  onAddCondition: (condition: Omit<Condition, "id">) => void;
  onUpdateCondition: (id: string, updates: Partial<Condition>) => void;
  onRemoveCondition: (id: string) => void;
  conditionFields: ConditionField[];
}

const operatorLabels: Record<string, string> = {
  equals: "igual a",
  not_equals: "diferente de",
  contains: "contem",
  not_contains: "nao contem",
  greater_than: "maior que",
  less_than: "menor que",
  greater_than_or_equal: "maior ou igual a",
  less_than_or_equal: "menor ou igual a",
  in: "esta em",
  not_in: "nao esta em",
};

export function ConditionBlock({
  conditions,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
  conditionFields,
}: ConditionBlockProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCondition, setNewCondition] = useState<Partial<Condition>>({
    field: "",
    operator: "equals",
    value: "",
    logic: "AND",
  });

  const handleAddCondition = () => {
    if (newCondition.field && newCondition.operator && newCondition.value !== "") {
      onAddCondition({
        field: newCondition.field,
        operator: newCondition.operator as Condition["operator"],
        value: newCondition.value,
        logic: conditions.length > 0 ? (newCondition.logic as "AND" | "OR") : undefined,
      });
      setNewCondition({
        field: "",
        operator: "equals",
        value: "",
        logic: "AND",
      });
      setShowAddForm(false);
    }
  };

  const getFieldInfo = (fieldPath: string) => {
    return conditionFields.find((f) => f.field === fieldPath);
  };

  const formatConditionText = (condition: Condition) => {
    const fieldInfo = getFieldInfo(condition.field);
    const fieldLabel = fieldInfo?.label || condition.field;
    const operatorLabel = operatorLabels[condition.operator] || condition.operator;
    return `${fieldLabel} ${operatorLabel} '${condition.value}'`;
  };

  return (
    <Card className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">SE (Condicoes)</CardTitle>
            <CardDescription className="text-sm">
              {conditions.length === 0
                ? "Opcional - adicione filtros"
                : `${conditions.length} condicao(oes) configurada(s)`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="shrink-0"
          >
            <Plus className="mr-1 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Existing Conditions */}
        {conditions.map((condition, index) => (
          <div key={condition.id} className="space-y-2">
            {index > 0 && condition.logic && (
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <Badge
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() =>
                    onUpdateCondition(condition.id, {
                      logic: condition.logic === "AND" ? "OR" : "AND",
                    })
                  }
                >
                  {condition.logic}
                </Badge>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}
            <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {formatConditionText(condition)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => onRemoveCondition(condition.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add Condition Form */}
        {showAddForm && (
          <div className="space-y-4 rounded-lg border bg-background p-4">
            <h4 className="font-medium">Nova Condicao</h4>

            {conditions.length > 0 && (
              <div className="space-y-2">
                <Label>Logica</Label>
                <Select
                  value={newCondition.logic}
                  onValueChange={(value) =>
                    setNewCondition((prev) => ({ ...prev, logic: value as ConditionLogic }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">E (AND)</SelectItem>
                    <SelectItem value="OR">OU (OR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Campo</Label>
              <Select
                value={newCondition.field}
                onValueChange={(value) =>
                  setNewCondition((prev) => ({
                    ...prev,
                    field: value,
                    operator: "equals",
                    value: "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um campo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" disabled>
                    -- Vaga --
                  </SelectItem>
                  {conditionFields
                    .filter((f) => f.category === "job")
                    .map((field) => (
                      <SelectItem key={field.field} value={field.field}>
                        {field.label}
                      </SelectItem>
                    ))}
                  <SelectItem value="" disabled>
                    -- Candidato --
                  </SelectItem>
                  {conditionFields
                    .filter((f) => f.category === "candidate")
                    .map((field) => (
                      <SelectItem key={field.field} value={field.field}>
                        {field.label}
                      </SelectItem>
                    ))}
                  <SelectItem value="" disabled>
                    -- Candidatura --
                  </SelectItem>
                  {conditionFields
                    .filter((f) => f.category === "application")
                    .map((field) => (
                      <SelectItem key={field.field} value={field.field}>
                        {field.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {newCondition.field && (
              <>
                <div className="space-y-2">
                  <Label>Operador</Label>
                  <Select
                    value={newCondition.operator}
                    onValueChange={(value) =>
                      setNewCondition((prev) => ({ ...prev, operator: value as ConditionOperator }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getFieldInfo(newCondition.field)?.operators.map((op) => (
                        <SelectItem key={op} value={op}>
                          {operatorLabels[op]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input
                    type={
                      getFieldInfo(newCondition.field)?.type === "number"
                        ? "number"
                        : "text"
                    }
                    placeholder="Digite o valor"
                    value={newCondition.value as string}
                    onChange={(e) =>
                      setNewCondition((prev) => ({
                        ...prev,
                        value:
                          getFieldInfo(prev.field || "")?.type === "number"
                            ? parseInt(e.target.value)
                            : e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAddCondition}
                disabled={
                  !newCondition.field ||
                  !newCondition.operator ||
                  newCondition.value === ""
                }
              >
                Adicionar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
