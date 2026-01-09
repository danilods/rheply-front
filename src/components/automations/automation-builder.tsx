"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowDown,
  Save,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { TriggerBlock } from "./trigger-block";
import { ConditionBlock } from "./condition-block";
import { ActionBlock } from "./action-block";
import { AutomationPreview } from "./automation-preview";
import { useAutomationBuilder } from "@/hooks/use-automation-builder";
import { useAutomationsStore } from "@/store/automations";

interface AutomationBuilderProps {
  automationId?: string;
  mode: "create" | "edit";
}

export function AutomationBuilder({ automationId, mode }: AutomationBuilderProps) {
  const router = useRouter();
  const {
    name,
    description,
    trigger,
    conditions,
    actions,
    isValid,
    validationErrors,
    setName,
    setDescription,
    setTrigger,
    addCondition,
    updateCondition,
    removeCondition,
    addAction,
    updateAction,
    removeAction,
    getAutomationData,
    loadAutomation,
    triggerOptions,
    actionOptions,
    conditionFields,
  } = useAutomationBuilder();

  const {
    currentAutomation,
    isCreating,
    isUpdating,
    isTesting,
    error,
    fetchAutomation,
    createAutomation,
    updateAutomation,
    testAutomation,
  } = useAutomationsStore();

  // Load automation data if editing
  useEffect(() => {
    if (mode === "edit" && automationId) {
      fetchAutomation(automationId);
    }
  }, [mode, automationId, fetchAutomation]);

  // Populate form with existing automation data
  useEffect(() => {
    if (currentAutomation && mode === "edit") {
      loadAutomation({
        name: currentAutomation.name,
        description: currentAutomation.description,
        trigger: currentAutomation.trigger,
        conditions: currentAutomation.conditions,
        actions: currentAutomation.actions,
      });
    }
  }, [currentAutomation, mode, loadAutomation]);

  const handleSave = async () => {
    if (!isValid) return;

    const automationData = getAutomationData();

    if (mode === "create") {
      const result = await createAutomation(automationData);
      if (result) {
        router.push("/automacoes");
      }
    } else if (mode === "edit" && automationId) {
      const result = await updateAutomation(automationId, automationData);
      if (result) {
        router.push("/automacoes");
      }
    }
  };

  const handleTest = async (sampleData: Record<string, any>) => {
    if (automationId) {
      return await testAutomation(automationId, sampleData);
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle>Informacoes Basicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome da Automacao
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Triagem Tech Automatica"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que esta automacao faz..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Visual Flow Builder */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fluxo da Automacao</h3>

        {/* Trigger Block */}
        <TriggerBlock
          trigger={trigger}
          onTriggerChange={setTrigger}
          triggerOptions={triggerOptions}
        />

        {/* Arrow Connector */}
        <div className="flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Condition Block */}
        <ConditionBlock
          conditions={conditions}
          onAddCondition={addCondition}
          onUpdateCondition={updateCondition}
          onRemoveCondition={removeCondition}
          conditionFields={conditionFields}
        />

        {/* Arrow Connector */}
        <div className="flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Action Block */}
        <ActionBlock
          actions={actions}
          onAddAction={addAction}
          onUpdateAction={updateAction}
          onRemoveAction={removeAction}
          actionOptions={actionOptions}
        />
      </div>

      <Separator />

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-inside list-disc space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* API Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Preview Section (only for edit mode) */}
      {mode === "edit" && automationId && (
        <AutomationPreview
          automationId={automationId}
          onTest={handleTest}
          isTesting={isTesting}
        />
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/automacoes")}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!isValid || isCreating || isUpdating}
        >
          {isCreating || isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === "create" ? "Criar Automacao" : "Salvar Alteracoes"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
