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
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  UserPlus,
  RefreshCw,
  Calendar,
  Clock,
  Target,
  Zap,
  ChevronRight,
} from "lucide-react";
import type { TriggerConfig, TriggerOption } from "@/types/automation";

interface TriggerBlockProps {
  trigger: TriggerConfig | null;
  onTriggerChange: (trigger: TriggerConfig) => void;
  triggerOptions: TriggerOption[];
}

const iconMap: Record<string, React.ReactNode> = {
  UserPlus: <UserPlus className="h-5 w-5" />,
  RefreshCw: <RefreshCw className="h-5 w-5" />,
  Calendar: <Calendar className="h-5 w-5" />,
  Clock: <Clock className="h-5 w-5" />,
  Target: <Target className="h-5 w-5" />,
};

export function TriggerBlock({
  trigger,
  onTriggerChange,
  triggerOptions,
}: TriggerBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(
    trigger?.type || null
  );
  const [params, setParams] = useState<Record<string, any>>(
    trigger?.params || {}
  );

  const selectedOption = triggerOptions.find((t) => t.type === selectedType);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    const option = triggerOptions.find((t) => t.type === type);
    // Initialize params with default values
    const newParams: Record<string, any> = {};
    option?.configFields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        newParams[field.name] = field.defaultValue;
      }
    });
    setParams(newParams);
  };

  const handleParamChange = (name: string, value: any) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (selectedType) {
      onTriggerChange({
        type: selectedType as TriggerConfig["type"],
        params,
      });
      setIsOpen(false);
    }
  };

  const getTriggerLabel = () => {
    if (!trigger) return "Clique para configurar";
    const option = triggerOptions.find((t) => t.type === trigger.type);
    if (!option) return trigger.type;

    let label = option.label;
    // Add parameter info if applicable
    if (trigger.type === "status_changed" && trigger.params.new_status) {
      label += ` para '${trigger.params.new_status}'`;
    } else if (trigger.type === "days_without_movement" && trigger.params.days) {
      label += ` (${trigger.params.days} dias)`;
    } else if (trigger.type === "match_score_threshold" && trigger.params.min_score) {
      label += ` >= ${trigger.params.min_score}%`;
    }
    return label;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            trigger
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : "border-dashed"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-base">QUANDO</CardTitle>
                <CardDescription className="text-sm">
                  {getTriggerLabel()}
                </CardDescription>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Configurar Trigger</SheetTitle>
          <SheetDescription>
            Escolha quando esta automacao deve ser acionada
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Trigger Type Selection */}
          <div className="space-y-2">
            <Label>Tipo de Trigger</Label>
            <div className="grid gap-3">
              {triggerOptions.map((option) => (
                <Card
                  key={option.type}
                  className={`cursor-pointer transition-all ${
                    selectedType === option.type
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleTypeSelect(option.type)}
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      {iconMap[option.icon] || <Zap className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{option.label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Trigger Parameters */}
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
                        handleParamChange(field.name, value)
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
                        handleParamChange(
                          field.name,
                          field.type === "number"
                            ? parseInt(e.target.value)
                            : e.target.value
                        )
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!selectedType}>
              Salvar Trigger
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
