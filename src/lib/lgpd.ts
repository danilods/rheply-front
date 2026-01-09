// LGPD (Lei Geral de Protecao de Dados) utilities

import { CookieConsent, NotificationSettings as TypedNotificationSettings, PrivacySettings as TypedPrivacySettings } from "@/types/lgpd";

export interface ConsentOptions {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  thirdParty: boolean;
}

// Alias for compatibility
export type { CookieConsent };

export interface DataExportRequest {
  userId: string;
  requestedAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
  downloadUrl?: string;
}

export interface DataDeletionRequest {
  userId: string;
  requestedAt: Date;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  scheduledFor?: Date;
}

const CONSENT_STORAGE_KEY = "rheply_consent";
const CONSENT_VERSION = "1.0";

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (parsed.version !== CONSENT_VERSION) return null;

    return parsed.options;
  } catch {
    return null;
  }
}

export function saveConsent(options: CookieConsent): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({
      version: CONSENT_VERSION,
      options,
      timestamp: new Date().toISOString(),
    })
  );
}

export function clearConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONSENT_STORAGE_KEY);
}

export function hasConsented(): boolean {
  return getStoredConsent() !== null;
}

export function hasRequiredConsent(): boolean {
  const consent = getStoredConsent();
  return consent?.essential === true;
}

export function formatDataRetentionPeriod(months: number): string {
  if (months < 12) {
    return `${months} meses`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} ano${years > 1 ? "s" : ""}`;
  }
  return `${years} ano${years > 1 ? "s" : ""} e ${remainingMonths} mes${remainingMonths > 1 ? "es" : ""}`;
}

export const LGPD_RIGHTS = {
  access: {
    title: "Direito de Acesso",
    description: "Voce pode solicitar uma copia de todos os dados que temos sobre voce.",
  },
  rectification: {
    title: "Direito de Retificacao",
    description: "Voce pode solicitar a correcao de dados incorretos ou incompletos.",
  },
  erasure: {
    title: "Direito ao Esquecimento",
    description: "Voce pode solicitar a exclusao dos seus dados pessoais.",
  },
  portability: {
    title: "Direito a Portabilidade",
    description: "Voce pode solicitar seus dados em formato estruturado para transferencia.",
  },
  objection: {
    title: "Direito de Oposicao",
    description: "Voce pode se opor ao tratamento dos seus dados para determinadas finalidades.",
  },
} as const;

export const DATA_CATEGORIES = {
  personal: {
    title: "Dados Pessoais",
    examples: ["Nome", "Email", "Telefone", "Endereco"],
    retentionMonths: 24,
  },
  professional: {
    title: "Dados Profissionais",
    examples: ["Curriculo", "Experiencia", "Formacao"],
    retentionMonths: 36,
  },
  behavioral: {
    title: "Dados de Comportamento",
    examples: ["Historico de candidaturas", "Interacoes com vagas"],
    retentionMonths: 12,
  },
  technical: {
    title: "Dados Tecnicos",
    examples: ["IP", "Navegador", "Dispositivo"],
    retentionMonths: 6,
  },
} as const;

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
}

export async function addConsentRecord(record: Omit<ConsentRecord, "id" | "timestamp">): Promise<ConsentRecord> {
  // In production, this would make an API call
  return {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    ...record,
  };
}

export function formatRetentionPeriod(months: number): string {
  if (months < 12) {
    return `${months} meses`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} ano${years > 1 ? "s" : ""}`;
  }
  return `${years} ano${years > 1 ? "s" : ""} e ${remainingMonths} mes${remainingMonths > 1 ? "es" : ""}`;
}

export interface PrivacySettings {
  dataRetention: boolean;
  marketingEmails: boolean;
  shareWithPartners: boolean;
  analyticsTracking: boolean;
  profileVisibility: "public" | "private" | "recruiters_only";
}

export function getDefaultPrivacySettingsFlat(): PrivacySettings {
  return {
    dataRetention: true,
    marketingEmails: false,
    shareWithPartners: false,
    analyticsTracking: true,
    profileVisibility: "recruiters_only",
  };
}

export function getDefaultPrivacySettings(): TypedPrivacySettings {
  return {
    profile_visible: true,
    available_for_proposals: true,
    share_with_partners: false,
    data_retention_period: 24,
    last_updated: new Date().toISOString(),
  };
}

export function getNotificationPreferences() {
  return {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    applicationUpdates: true,
    newJobAlerts: true,
    marketingMessages: false,
  };
}

export interface ConsentHistoryEntry {
  id: string;
  type: string;
  action: "granted" | "revoked";
  timestamp: Date;
  details?: string;
}

export function getConsentHistory(): ConsentHistoryEntry[] {
  // In production, this would make an API call
  return [
    {
      id: "1",
      type: "cookies_analytics",
      action: "granted",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      details: "Cookies de análise",
    },
    {
      id: "2",
      type: "data_processing",
      action: "granted",
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      details: "Processamento de dados para recrutamento",
    },
  ];
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;

  const diffMonths = Math.floor(diffDays / 30);
  return `há ${diffMonths} ${diffMonths > 1 ? "meses" : "mês"}`;
}

export interface DataExport {
  personal: Record<string, unknown>;
  applications: unknown[];
  consents: ConsentHistoryEntry[];
  exportedAt: Date;
}

export interface UserDataExportInput {
  personal_info: {
    name: string;
    email: string;
    phone?: string;
    created_at: string;
  };
  profile_data?: {
    skills?: string[];
    experience?: unknown[];
    education?: unknown[];
  };
  applications?: unknown[];
  consent_history?: ConsentHistoryEntry[];
  notifications?: unknown[];
  activity_log?: unknown[];
}

export function generateDataExport(data: UserDataExportInput): UserDataExportInput & { exported_at: string } {
  return {
    ...data,
    consent_history: data.consent_history || getConsentHistory(),
    exported_at: new Date().toISOString(),
  };
}

export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  applicationUpdates: boolean;
  newJobAlerts: boolean;
  marketingMessages: boolean;
}

export function getDefaultNotificationSettingsFlat(): NotificationSettings {
  return {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    applicationUpdates: true,
    newJobAlerts: true,
    marketingMessages: false,
  };
}

export function getDefaultNotificationSettings(): TypedNotificationSettings {
  const defaultSettings = {
    status_updates: true,
    interview_reminders: true,
    new_messages: true,
    job_recommendations: true,
    feedback_received: true,
  };

  return {
    email: { ...defaultSettings },
    whatsapp: { ...defaultSettings, job_recommendations: false },
    push: { ...defaultSettings },
  };
}
