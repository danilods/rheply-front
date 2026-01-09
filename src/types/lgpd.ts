// LGPD (Lei Geral de Proteção de Dados) Types

export type ConsentType =
  | 'essential_cookies'
  | 'analytics_cookies'
  | 'marketing_cookies'
  | 'data_processing'
  | 'profile_sharing'
  | 'partner_sharing'
  | 'email_notifications'
  | 'whatsapp_notifications'
  | 'push_notifications'
  | 'job_recommendations';

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  granted: boolean;
  granted_at: string;
  revoked_at?: string;
  ip_address?: string;
  user_agent?: string;
  version: string;
}

export interface ConsentHistory {
  consent_type: ConsentType;
  action: 'granted' | 'revoked';
  timestamp: string;
  ip_address?: string;
}

export interface PrivacySettings {
  profile_visible: boolean;
  available_for_proposals: boolean;
  share_with_partners: boolean;
  data_retention_period: number; // in months
  last_updated: string;
}

export interface NotificationSettings {
  email: {
    status_updates: boolean;
    interview_reminders: boolean;
    new_messages: boolean;
    job_recommendations: boolean;
    feedback_received: boolean;
  };
  whatsapp: {
    status_updates: boolean;
    interview_reminders: boolean;
    new_messages: boolean;
    job_recommendations: boolean;
    feedback_received: boolean;
  };
  push: {
    status_updates: boolean;
    interview_reminders: boolean;
    new_messages: boolean;
    job_recommendations: boolean;
    feedback_received: boolean;
  };
}

export interface DataExportRequest {
  id: string;
  user_id: string;
  requested_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: 'json' | 'pdf';
  download_url?: string;
  expires_at?: string;
  completed_at?: string;
}

export interface DataDeletionRequest {
  id: string;
  user_id: string;
  requested_at: string;
  reason?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  scheduled_deletion_date: string;
  completed_at?: string;
}

export interface UserDataExport {
  personal_info: {
    name: string;
    email: string;
    phone?: string;
    created_at: string;
  };
  profile_data: {
    skills: string[];
    experience: object[];
    education: object[];
    resume_url?: string;
  };
  applications: object[];
  privacy_settings: PrivacySettings;
  consent_history: ConsentHistory[];
  notifications: object[];
  activity_log: object[];
  exported_at: string;
}

export interface JobAlert {
  id: string;
  user_id: string;
  keywords: string[];
  location?: string;
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  frequency: 'daily' | 'weekly';
  is_active: boolean;
  created_at: string;
  last_sent_at?: string;
}

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  consented_at?: string;
}

export type NotificationType =
  | 'status_update'
  | 'interview_scheduled'
  | 'new_message'
  | 'job_recommendation'
  | 'feedback_received';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  description: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface AccountSettings {
  email: string;
  phone?: string;
  whatsapp?: string;
}
