/**
 * Hook for managing automation builder state
 */
import { useState, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  TriggerConfig,
  Condition,
  Action,
  TriggerOption,
  ActionOption,
  ConditionField,
  AutomationCreateInput,
} from "@/types/automation";

interface UseAutomationBuilderReturn {
  // State
  name: string;
  description: string;
  trigger: TriggerConfig | null;
  conditions: Condition[];
  actions: Action[];
  isValid: boolean;
  validationErrors: string[];

  // Setters
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setTrigger: (trigger: TriggerConfig) => void;

  // Condition Management
  addCondition: (condition: Omit<Condition, "id">) => void;
  updateCondition: (id: string, updates: Partial<Condition>) => void;
  removeCondition: (id: string) => void;
  reorderConditions: (fromIndex: number, toIndex: number) => void;

  // Action Management
  addAction: (action: Omit<Action, "id">) => void;
  updateAction: (id: string, updates: Partial<Action>) => void;
  removeAction: (id: string) => void;
  reorderActions: (fromIndex: number, toIndex: number) => void;

  // Builder Utilities
  getAutomationData: () => AutomationCreateInput;
  reset: () => void;
  loadAutomation: (data: Partial<AutomationCreateInput>) => void;

  // Options
  triggerOptions: TriggerOption[];
  actionOptions: ActionOption[];
  conditionFields: ConditionField[];
}

// Trigger type options
const triggerOptions: TriggerOption[] = [
  {
    type: "application_received",
    label: "Candidatura Recebida",
    description: "Quando uma nova candidatura for recebida",
    icon: "UserPlus",
    configFields: [],
  },
  {
    type: "status_changed",
    label: "Status Alterado",
    description: "Quando o status da candidatura mudar",
    icon: "RefreshCw",
    configFields: [
      {
        name: "new_status",
        label: "Novo Status",
        type: "select",
        options: [
          { label: "Em Analise", value: "analyzing" },
          { label: "Entrevista", value: "interview" },
          { label: "Teste Tecnico", value: "technical_test" },
          { label: "Oferta", value: "offer" },
          { label: "Contratado", value: "hired" },
          { label: "Rejeitado", value: "rejected" },
        ],
        required: true,
      },
    ],
  },
  {
    type: "interview_scheduled",
    label: "Entrevista Agendada",
    description: "Quando uma entrevista for agendada",
    icon: "Calendar",
    configFields: [],
  },
  {
    type: "days_without_movement",
    label: "Dias Sem Movimentacao",
    description: "Quando candidatura ficar X dias sem atividade",
    icon: "Clock",
    configFields: [
      {
        name: "days",
        label: "Numero de Dias",
        type: "number",
        required: true,
        placeholder: "Ex: 7",
        defaultValue: 7,
      },
    ],
  },
  {
    type: "match_score_threshold",
    label: "Score de Match",
    description: "Quando score de match atingir um valor",
    icon: "Target",
    configFields: [
      {
        name: "min_score",
        label: "Score Minimo (%)",
        type: "number",
        required: true,
        placeholder: "Ex: 80",
        defaultValue: 80,
      },
    ],
  },
];

// Action type options
const actionOptions: ActionOption[] = [
  {
    type: "send_whatsapp",
    label: "Enviar WhatsApp",
    description: "Enviar mensagem via WhatsApp",
    icon: "MessageCircle",
    configFields: [
      {
        name: "template",
        label: "Template",
        type: "select",
        options: [
          { label: "Confirmacao de Candidatura", value: "application_received" },
          { label: "Convite para Entrevista", value: "interview_invitation" },
          { label: "Lembrete de Entrevista", value: "interview_reminder" },
          { label: "Resultado do Processo", value: "process_result" },
        ],
        required: true,
      },
    ],
  },
  {
    type: "send_email",
    label: "Enviar Email",
    description: "Enviar email automatico",
    icon: "Mail",
    configFields: [
      {
        name: "template",
        label: "Template",
        type: "select",
        options: [
          { label: "Confirmacao de Candidatura", value: "application_received" },
          { label: "Convite para Teste", value: "tech_test_invitation" },
          { label: "Confirmacao de Entrevista", value: "interview_confirmation" },
          { label: "Feedback", value: "feedback" },
        ],
        required: true,
      },
      {
        name: "subject",
        label: "Assunto",
        type: "text",
        required: true,
        placeholder: "Assunto do email",
      },
    ],
  },
  {
    type: "move_stage",
    label: "Mover para Etapa",
    description: "Mover candidatura para outra etapa",
    icon: "ArrowRight",
    configFields: [
      {
        name: "stage_name",
        label: "Nome da Etapa",
        type: "select",
        options: [
          { label: "Triagem", value: "screening" },
          { label: "Entrevista Inicial", value: "initial_interview" },
          { label: "Teste Tecnico", value: "technical_test" },
          { label: "Entrevista Tecnica", value: "technical_interview" },
          { label: "Entrevista Final", value: "final_interview" },
          { label: "Oferta", value: "offer" },
        ],
        required: true,
      },
    ],
  },
  {
    type: "add_tag",
    label: "Adicionar Tag",
    description: "Adicionar tag ao candidato",
    icon: "Tag",
    configFields: [
      {
        name: "tag",
        label: "Tag",
        type: "text",
        required: true,
        placeholder: "Ex: high-priority",
      },
    ],
  },
  {
    type: "send_test",
    label: "Enviar Teste Tecnico",
    description: "Enviar teste tecnico automaticamente",
    icon: "Code",
    configFields: [
      {
        name: "test_type",
        label: "Tipo de Teste",
        type: "select",
        options: [
          { label: "Python", value: "python" },
          { label: "JavaScript", value: "javascript" },
          { label: "React", value: "react" },
          { label: "SQL", value: "sql" },
          { label: "Generico", value: "generic" },
        ],
        required: true,
      },
      {
        name: "duration_hours",
        label: "Duracao (horas)",
        type: "number",
        required: true,
        defaultValue: 48,
      },
    ],
  },
  {
    type: "notify_manager",
    label: "Notificar Gestor",
    description: "Enviar notificacao para o gestor",
    icon: "Bell",
    configFields: [
      {
        name: "message",
        label: "Mensagem",
        type: "text",
        required: true,
        placeholder: "Mensagem da notificacao",
      },
      {
        name: "channel",
        label: "Canal",
        type: "select",
        options: [
          { label: "Email", value: "email" },
          { label: "Slack", value: "slack" },
          { label: "Sistema", value: "system" },
        ],
        required: true,
        defaultValue: "email",
      },
    ],
  },
  {
    type: "add_note",
    label: "Adicionar Nota",
    description: "Adicionar nota automatica",
    icon: "FileText",
    configFields: [
      {
        name: "note",
        label: "Nota",
        type: "text",
        required: true,
        placeholder: "Texto da nota",
      },
    ],
  },
  {
    type: "schedule_interview",
    label: "Agendar Entrevista",
    description: "Sugerir horario para entrevista",
    icon: "CalendarPlus",
    configFields: [
      {
        name: "type",
        label: "Tipo",
        type: "select",
        options: [
          { label: "Telefone", value: "phone" },
          { label: "Video", value: "video" },
          { label: "Presencial", value: "onsite" },
        ],
        required: true,
      },
      {
        name: "duration_minutes",
        label: "Duracao (minutos)",
        type: "number",
        required: true,
        defaultValue: 30,
      },
    ],
  },
];

// Condition field options
const conditionFields: ConditionField[] = [
  {
    field: "job.department",
    label: "Departamento da Vaga",
    type: "string",
    category: "job",
    operators: ["equals", "not_equals", "contains", "in"],
  },
  {
    field: "job.title",
    label: "Titulo da Vaga",
    type: "string",
    category: "job",
    operators: ["equals", "not_equals", "contains"],
  },
  {
    field: "job.location",
    label: "Localizacao da Vaga",
    type: "string",
    category: "job",
    operators: ["equals", "not_equals", "contains"],
  },
  {
    field: "job.employment_type",
    label: "Tipo de Contrato",
    type: "string",
    category: "job",
    operators: ["equals", "not_equals"],
  },
  {
    field: "candidate.skills",
    label: "Skills do Candidato",
    type: "array",
    category: "candidate",
    operators: ["contains", "not_contains"],
  },
  {
    field: "candidate.years_experience",
    label: "Anos de Experiencia",
    type: "number",
    category: "candidate",
    operators: ["equals", "greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal"],
  },
  {
    field: "candidate.location",
    label: "Localizacao do Candidato",
    type: "string",
    category: "candidate",
    operators: ["equals", "not_equals", "contains"],
  },
  {
    field: "candidate.languages",
    label: "Idiomas",
    type: "array",
    category: "candidate",
    operators: ["contains", "not_contains"],
  },
  {
    field: "application.match_score",
    label: "Score de Match",
    type: "number",
    category: "application",
    operators: ["equals", "greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal"],
  },
  {
    field: "application.status",
    label: "Status da Candidatura",
    type: "string",
    category: "application",
    operators: ["equals", "not_equals"],
  },
];

export function useAutomationBuilder(): UseAutomationBuilderReturn {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState<TriggerConfig | null>(null);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  // Validation
  const { isValid, validationErrors } = useMemo(() => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push("Nome da automacao e obrigatorio");
    }

    if (!trigger) {
      errors.push("Selecione um trigger");
    }

    if (actions.length === 0) {
      errors.push("Adicione pelo menos uma acao");
    }

    // Validate trigger params
    if (trigger) {
      const triggerOption = triggerOptions.find((t) => t.type === trigger.type);
      if (triggerOption) {
        for (const field of triggerOption.configFields) {
          if (field.required && !trigger.params[field.name]) {
            errors.push(`Parametro '${field.label}' do trigger e obrigatorio`);
          }
        }
      }
    }

    // Validate actions
    actions.forEach((action, index) => {
      const actionOption = actionOptions.find((a) => a.type === action.type);
      if (actionOption) {
        for (const field of actionOption.configFields) {
          if (field.required && !action.params[field.name]) {
            errors.push(`Acao ${index + 1}: parametro '${field.label}' e obrigatorio`);
          }
        }
      }
    });

    // Validate conditions
    conditions.forEach((condition, index) => {
      if (!condition.field) {
        errors.push(`Condicao ${index + 1}: campo e obrigatorio`);
      }
      if (!condition.operator) {
        errors.push(`Condicao ${index + 1}: operador e obrigatorio`);
      }
      if (condition.value === undefined || condition.value === "") {
        errors.push(`Condicao ${index + 1}: valor e obrigatorio`);
      }
    });

    return {
      isValid: errors.length === 0,
      validationErrors: errors,
    };
  }, [name, trigger, conditions, actions]);

  // Condition management
  const addCondition = useCallback((condition: Omit<Condition, "id">) => {
    const newCondition: Condition = {
      ...condition,
      id: uuidv4(),
    };
    setConditions((prev) => [...prev, newCondition]);
  }, []);

  const updateCondition = useCallback((id: string, updates: Partial<Condition>) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const removeCondition = useCallback((id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const reorderConditions = useCallback((fromIndex: number, toIndex: number) => {
    setConditions((prev) => {
      const newConditions = [...prev];
      const [removed] = newConditions.splice(fromIndex, 1);
      newConditions.splice(toIndex, 0, removed);
      return newConditions;
    });
  }, []);

  // Action management
  const addAction = useCallback((action: Omit<Action, "id">) => {
    const newAction: Action = {
      ...action,
      id: uuidv4(),
    };
    setActions((prev) => [...prev, newAction]);
  }, []);

  const updateAction = useCallback((id: string, updates: Partial<Action>) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const removeAction = useCallback((id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const reorderActions = useCallback((fromIndex: number, toIndex: number) => {
    setActions((prev) => {
      const newActions = [...prev];
      const [removed] = newActions.splice(fromIndex, 1);
      newActions.splice(toIndex, 0, removed);
      return newActions;
    });
  }, []);

  // Get automation data for submission
  const getAutomationData = useCallback((): AutomationCreateInput => {
    return {
      name,
      description,
      trigger: trigger!,
      conditions,
      actions,
      is_active: false,
    };
  }, [name, description, trigger, conditions, actions]);

  // Reset builder
  const reset = useCallback(() => {
    setName("");
    setDescription("");
    setTrigger(null);
    setConditions([]);
    setActions([]);
  }, []);

  // Load existing automation
  const loadAutomation = useCallback((data: Partial<AutomationCreateInput>) => {
    if (data.name) setName(data.name);
    if (data.description) setDescription(data.description);
    if (data.trigger) setTrigger(data.trigger);
    if (data.conditions) setConditions(data.conditions);
    if (data.actions) setActions(data.actions);
  }, []);

  return {
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
    reorderConditions,
    addAction,
    updateAction,
    removeAction,
    reorderActions,
    getAutomationData,
    reset,
    loadAutomation,
    triggerOptions,
    actionOptions,
    conditionFields,
  };
}
