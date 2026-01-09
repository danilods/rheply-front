import {
  ApplicationStatusValue,
  KanbanColumnValue,
  SkillProficiencyValue,
  LanguageProficiencyValue,
  NotificationTypeValue,
  PrivacyVisibilityValue,
} from '@/constants/candidate';

// Base pagination response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// Parsed CV Response (from AI)
export interface ParsedCVResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  data?: ParsedCVData;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface ParsedCVData {
  personal_info: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    location?: string;
    date_of_birth?: string;
    nationality?: string;
  };
  summary?: string;
  skills: ParsedSkill[];
  work_experience: ParsedWorkExperience[];
  education: ParsedEducation[];
  languages: ParsedLanguage[];
  certifications: ParsedCertification[];
  projects: ParsedProject[];
  social_links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
    other?: string[];
  };
  raw_text?: string;
  confidence_score: number;
}

export interface ParsedSkill {
  name: string;
  proficiency?: SkillProficiencyValue;
  years_of_experience?: number;
  category?: string;
}

export interface ParsedWorkExperience {
  company: string;
  title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements?: string[];
  technologies?: string[];
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  gpa?: string;
  description?: string;
  honors?: string[];
}

export interface ParsedLanguage {
  name: string;
  proficiency: LanguageProficiencyValue;
}

export interface ParsedCertification {
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface ParsedProject {
  name: string;
  description: string;
  url?: string;
  technologies?: string[];
  start_date?: string;
  end_date?: string;
}

// Candidate Profile
export interface CandidateProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  date_of_birth?: string;
  nationality?: string;
  summary?: string;
  headline?: string;
  avatar_url?: string;
  skills: CandidateSkill[];
  work_experience: CandidateWorkExperience[];
  education: CandidateEducation[];
  languages: CandidateLanguage[];
  certifications: CandidateCertification[];
  projects: CandidateProject[];
  social_links: CandidateSocialLinks;
  privacy_settings: ProfilePrivacySettings;
  profile_completion: number;
  is_actively_looking: boolean;
  preferred_job_types: string[];
  preferred_locations: string[];
  expected_salary?: SalaryExpectation;
  created_at: string;
  updated_at: string;
}

export interface CandidateSkill {
  id: string;
  name: string;
  proficiency: SkillProficiencyValue;
  years_of_experience?: number;
  category?: string;
  is_endorsed: boolean;
  endorsement_count: number;
}

export interface CandidateWorkExperience {
  id: string;
  company: string;
  title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements?: string[];
  technologies?: string[];
}

export interface CandidateEducation {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  gpa?: string;
  description?: string;
  honors?: string[];
}

export interface CandidateLanguage {
  id: string;
  name: string;
  proficiency: LanguageProficiencyValue;
}

export interface CandidateCertification {
  id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface CandidateProject {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies?: string[];
  start_date?: string;
  end_date?: string;
  images?: string[];
}

export interface CandidateSocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  other?: string[];
}

export interface ProfilePrivacySettings {
  profile_visibility: PrivacyVisibilityValue;
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  allow_recruiter_contact: boolean;
  show_current_company: boolean;
}

export interface SalaryExpectation {
  min: number;
  max: number;
  currency: string;
  period: 'hourly' | 'monthly' | 'yearly';
}

// Applications
export interface ApplicationDetail {
  id: string;
  job: JobSummary;
  status: ApplicationStatusValue;
  stage: string;
  cover_letter?: string;
  resume_url?: string;
  applied_at: string;
  updated_at: string;
  interviews: ApplicationInterview[];
  timeline: ApplicationTimelineEvent[];
  match_score?: number;
  recruiter_notes?: string;
  next_steps?: string;
}

export interface JobSummary {
  id: string;
  title: string;
  company: CompanySummary;
  location: string;
  type: string;
  salary_range?: string;
  posted_at: string;
  application_deadline?: string;
}

export interface CompanySummary {
  id: string;
  name: string;
  logo_url?: string;
  industry?: string;
  size?: string;
}

export interface ApplicationInterview {
  id: string;
  type: string;
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  meeting_url?: string;
  interviewers: InterviewerInfo[];
  status: string;
  notes?: string;
}

export interface InterviewerInfo {
  id: string;
  name: string;
  title: string;
  avatar_url?: string;
}

export interface ApplicationTimelineEvent {
  id: string;
  type: string;
  title: string;
  description?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export type PaginatedApplications = PaginatedResponse<ApplicationDetail>;

// Jobs
export interface JobDetail {
  id: string;
  slug: string;
  title: string;
  company: CompanyDetail;
  department: string;
  location: string;
  type: string;
  work_mode: 'remote' | 'hybrid' | 'onsite';
  description: string;
  requirements: string[];
  responsibilities: string[];
  nice_to_have?: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;
  benefits?: string[];
  skills_required: string[];
  experience_level: string;
  education_required?: string;
  positions_available: number;
  application_deadline?: string;
  is_saved: boolean;
  has_applied: boolean;
  application_id?: string;
  match_score?: number;
  posted_at: string;
  views_count: number;
  applications_count: number;
  similar_jobs?: JobSummary[];
}

export interface CompanyDetail {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  cover_image_url?: string;
  description?: string;
  industry: string;
  size: string;
  founded_year?: number;
  website?: string;
  locations: string[];
  culture_values?: string[];
  benefits?: string[];
  social_links?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  rating?: number;
  reviews_count?: number;
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  company: CompanySummary;
  location: string;
  type: string;
  work_mode: 'remote' | 'hybrid' | 'onsite';
  salary_range?: string;
  skills_required: string[];
  experience_level: string;
  is_saved: boolean;
  has_applied: boolean;
  match_score?: number;
  posted_at: string;
  application_deadline?: string;
}

export type PaginatedJobs = PaginatedResponse<Job>;

// Job Search
export interface JobSearchQuery {
  query?: string;
  location?: string;
  radius_km?: number;
  job_types?: string[];
  work_modes?: string[];
  experience_levels?: string[];
  salary_min?: number;
  salary_max?: number;
  skills?: string[];
  industries?: string[];
  company_sizes?: string[];
  posted_within_days?: number;
  sort_by?: 'relevance' | 'date' | 'salary';
  page?: number;
  page_size?: number;
}

export interface JobSearchResponse {
  jobs: PaginatedJobs;
  filters_applied: Record<string, unknown>;
  suggested_filters?: SuggestedFilter[];
  total_results: number;
  search_id: string;
}

export interface SuggestedFilter {
  type: string;
  label: string;
  value: string;
  count: number;
}

// Job Tracker (Kanban)
export interface TrackedJob {
  id: string;
  job_id?: string;
  title: string;
  company: string;
  company_logo?: string;
  location?: string;
  url?: string;
  status: KanbanColumnValue;
  salary_range?: string;
  notes?: string;
  deadline?: string;
  contact_person?: string;
  contact_email?: string;
  follow_up_date?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  position: number;
}

export interface TrackedJobInput {
  job_id?: string;
  title: string;
  company: string;
  company_logo?: string;
  location?: string;
  url?: string;
  status?: KanbanColumnValue;
  salary_range?: string;
  notes?: string;
  deadline?: string;
  contact_person?: string;
  contact_email?: string;
  tags?: string[];
}

// Notifications
export interface Notification {
  id: string;
  type: NotificationTypeValue;
  title: string;
  message: string;
  is_read: boolean;
  data?: Record<string, unknown>;
  action_url?: string;
  created_at: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  application_updates: boolean;
  interview_reminders: boolean;
  job_alerts: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
}

// Settings
export interface PrivacySettings {
  profile_visibility: PrivacyVisibilityValue;
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  allow_recruiter_contact: boolean;
  show_current_company: boolean;
  searchable_by_recruiters: boolean;
  show_activity_status: boolean;
}

// Job Alerts
export interface JobAlert {
  id: string;
  name: string;
  query: string;
  filters: JobSearchQuery;
  frequency: 'daily' | 'weekly' | 'instant';
  is_active: boolean;
  last_sent_at?: string;
  matches_count: number;
  created_at: string;
}

export interface JobAlertInput {
  name: string;
  query: string;
  filters: JobSearchQuery;
  frequency: 'daily' | 'weekly' | 'instant';
}

// Error Response
export interface ApiErrorResponse {
  message: string;
  code?: string;
  field_errors?: Record<string, string[]>;
  details?: Record<string, unknown>;
}

// Upload Response
export interface UploadResponse {
  file_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

// Export Data Response
export interface ExportDataResponse {
  download_url: string;
  expires_at: string;
  file_format: string;
  file_size: number;
}

// Account Deletion Response
export interface AccountDeletionResponse {
  request_id: string;
  scheduled_for: string;
  can_cancel_until: string;
}
