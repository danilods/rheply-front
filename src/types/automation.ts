/**
 * Automation types for the Low-Code Automation Builder
 * Module 2.5 - PRD
 */

export type TriggerType =
  | "application_received"
  | "status_changed"
  | "interview_scheduled"
  | "days_without_movement"
  | "match_score_threshold"
  | "date_based";

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "in"
  | "not_in";

export type ConditionLogic = "AND" | "OR";

export type ActionType =
  | "send_whatsapp"
  | "send_email"
  | "move_stage"
  | "add_tag"
  | "schedule_interview"
  | "send_test"
  | "notify_manager"
  | "add_note"
  | "update_field";

export interface TriggerConfig {
  type: TriggerType;
  params: Record<string, any>;
}

export interface Condition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: any;
  logic?: ConditionLogic;
}

export interface Action {
  id: string;
  type: ActionType;
  params: Record<string, any>;
  delay_minutes?: number;
}

export interface Automation {
  id: string;
  company_id: string;
  name: string;
  description: string;
  trigger: TriggerConfig;
  conditions: Condition[];
  actions: Action[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  run_count: number;
  last_run_at: string | null;
}

export interface AutomationRun {
  id: string;
  automation_id: string;
  triggered_by: string;
  context: Record<string, any>;
  result: Record<string, any>;
  status: "success" | "failed" | "skipped";
  executed_at: string;
  duration_ms: number;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: TriggerConfig;
  conditions: Condition[];
  actions: Action[];
  icon: string;
}

export interface AutomationNode {
  id: string;
  type: "trigger" | "condition" | "action";
  data: TriggerConfig | Condition | Action;
  position: { x: number; y: number };
}

export interface AutomationCreateInput {
  name: string;
  description: string;
  trigger: TriggerConfig;
  conditions: Condition[];
  actions: Action[];
  is_active?: boolean;
}

export interface AutomationUpdateInput {
  name?: string;
  description?: string;
  trigger?: TriggerConfig;
  conditions?: Condition[];
  actions?: Action[];
  is_active?: boolean;
}

// UI Helper Types
export interface TriggerOption {
  type: TriggerType;
  label: string;
  description: string;
  icon: string;
  configFields: ConfigField[];
}

export interface ActionOption {
  type: ActionType;
  label: string;
  description: string;
  icon: string;
  configFields: ConfigField[];
}

export interface ConfigField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "multiselect" | "boolean" | "template";
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
}

export interface ConditionField {
  field: string;
  label: string;
  type: "string" | "number" | "array" | "boolean";
  category: "job" | "candidate" | "application";
  operators: ConditionOperator[];
}
