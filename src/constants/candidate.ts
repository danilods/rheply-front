// Application status values
export const APPLICATION_STATUSES = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  SHORTLISTED: 'shortlisted',
  INTERVIEWING: 'interviewing',
  OFFER_EXTENDED: 'offer_extended',
  OFFER_ACCEPTED: 'offer_accepted',
  OFFER_DECLINED: 'offer_declined',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;

export type ApplicationStatusValue = typeof APPLICATION_STATUSES[keyof typeof APPLICATION_STATUSES];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatusValue, string> = {
  pending: 'Pending',
  reviewing: 'Under Review',
  shortlisted: 'Shortlisted',
  interviewing: 'Interviewing',
  offer_extended: 'Offer Extended',
  offer_accepted: 'Offer Accepted',
  offer_declined: 'Offer Declined',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatusValue, string> = {
  pending: 'bg-gray-100 text-gray-800',
  reviewing: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  interviewing: 'bg-yellow-100 text-yellow-800',
  offer_extended: 'bg-green-100 text-green-800',
  offer_accepted: 'bg-emerald-100 text-emerald-800',
  offer_declined: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
};

// Kanban columns for job tracker
export const KANBAN_COLUMNS = {
  WISHLIST: 'wishlist',
  APPLIED: 'applied',
  INTERVIEWING: 'interviewing',
  OFFER: 'offer',
  REJECTED: 'rejected',
} as const;

export type KanbanColumnValue = typeof KANBAN_COLUMNS[keyof typeof KANBAN_COLUMNS];

export const KANBAN_COLUMN_LABELS: Record<KanbanColumnValue, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  rejected: 'Rejected',
};

export const KANBAN_COLUMN_COLORS: Record<KanbanColumnValue, string> = {
  wishlist: 'border-gray-300',
  applied: 'border-blue-300',
  interviewing: 'border-yellow-300',
  offer: 'border-green-300',
  rejected: 'border-red-300',
};

// Skill proficiency levels
export const SKILL_PROFICIENCY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const;

export type SkillProficiencyValue = typeof SKILL_PROFICIENCY_LEVELS[keyof typeof SKILL_PROFICIENCY_LEVELS];

export const SKILL_PROFICIENCY_LABELS: Record<SkillProficiencyValue, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export const SKILL_PROFICIENCY_SCORES: Record<SkillProficiencyValue, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

// Language proficiency levels (CEFR standard)
export const LANGUAGE_PROFICIENCY_LEVELS = {
  A1: 'a1',
  A2: 'a2',
  B1: 'b1',
  B2: 'b2',
  C1: 'c1',
  C2: 'c2',
  NATIVE: 'native',
} as const;

export type LanguageProficiencyValue = typeof LANGUAGE_PROFICIENCY_LEVELS[keyof typeof LANGUAGE_PROFICIENCY_LEVELS];

export const LANGUAGE_PROFICIENCY_LABELS: Record<LanguageProficiencyValue, string> = {
  a1: 'A1 - Beginner',
  a2: 'A2 - Elementary',
  b1: 'B1 - Intermediate',
  b2: 'B2 - Upper Intermediate',
  c1: 'C1 - Advanced',
  c2: 'C2 - Proficient',
  native: 'Native',
};

// Notification types
export const NOTIFICATION_TYPES = {
  APPLICATION_STATUS_CHANGED: 'application_status_changed',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  INTERVIEW_REMINDER: 'interview_reminder',
  NEW_JOB_MATCH: 'new_job_match',
  PROFILE_VIEW: 'profile_view',
  JOB_ALERT: 'job_alert',
  OFFER_RECEIVED: 'offer_received',
  APPLICATION_DEADLINE: 'application_deadline',
  SYSTEM: 'system',
} as const;

export type NotificationTypeValue = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationTypeValue, string> = {
  application_status_changed: 'Application Update',
  interview_scheduled: 'Interview Scheduled',
  interview_reminder: 'Interview Reminder',
  new_job_match: 'New Job Match',
  profile_view: 'Profile Viewed',
  job_alert: 'Job Alert',
  offer_received: 'Offer Received',
  application_deadline: 'Application Deadline',
  system: 'System Notification',
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationTypeValue, string> = {
  application_status_changed: 'briefcase',
  interview_scheduled: 'calendar',
  interview_reminder: 'bell',
  new_job_match: 'target',
  profile_view: 'eye',
  job_alert: 'bell-ring',
  offer_received: 'gift',
  application_deadline: 'clock',
  system: 'info',
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_CV_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ALLOWED_CV_EXTENSIONS: ['.pdf', '.doc', '.docx'],
} as const;

// Profile completion sections
export const PROFILE_SECTIONS = {
  BASIC_INFO: 'basic_info',
  CONTACT: 'contact',
  SUMMARY: 'summary',
  SKILLS: 'skills',
  EXPERIENCE: 'experience',
  EDUCATION: 'education',
  LANGUAGES: 'languages',
  CERTIFICATIONS: 'certifications',
  PROJECTS: 'projects',
  SOCIAL_LINKS: 'social_links',
} as const;

export const PROFILE_SECTION_WEIGHTS: Record<string, number> = {
  basic_info: 15,
  contact: 10,
  summary: 10,
  skills: 15,
  experience: 20,
  education: 15,
  languages: 5,
  certifications: 5,
  projects: 5,
  social_links: 0,
};

// Job search defaults
export const JOB_SEARCH_DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_SALARY_RANGE: 500000,
  DEFAULT_RADIUS_KM: 50,
} as const;

// Privacy settings
export const PRIVACY_VISIBILITY = {
  PUBLIC: 'public',
  EMPLOYERS_ONLY: 'employers_only',
  PRIVATE: 'private',
} as const;

export type PrivacyVisibilityValue = typeof PRIVACY_VISIBILITY[keyof typeof PRIVACY_VISIBILITY];

export const PRIVACY_VISIBILITY_LABELS: Record<PrivacyVisibilityValue, string> = {
  public: 'Public - Visible to everyone',
  employers_only: 'Employers Only - Only registered companies can view',
  private: 'Private - Only you can see',
};

// WebSocket events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NOTIFICATION: 'notification',
  APPLICATION_UPDATE: 'application_update',
  JOB_MATCH: 'job_match',
  RECONNECT: 'reconnect',
  ERROR: 'error',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  RECENT_SEARCHES: 'candidate_recent_searches',
  TRACKED_JOBS: 'candidate_tracked_jobs',
  DRAFT_PROFILE: 'candidate_draft_profile',
  NOTIFICATION_PREFERENCES: 'candidate_notification_prefs',
} as const;
