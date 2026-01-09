// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  ADMIN = 'admin',
  RECRUITER = 'recruiter',
  HIRING_MANAGER = 'hiring_manager',
  VIEWER = 'viewer',
}

// Authentication types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// Candidate types
export interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience_years?: number;
  education?: Education[];
  work_experience?: WorkExperience[];
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  status: CandidateStatus;
  source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export enum CandidateStatus {
  NEW = 'new',
  SCREENING = 'screening',
  INTERVIEWING = 'interviewing',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements?: string[];
}

// Job types
export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  benefits?: string[];
  status: JobStatus;
  priority: JobPriority;
  hiring_manager_id?: string;
  recruiter_id?: string;
  positions_available: number;
  positions_filled: number;
  application_deadline?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  TEMPORARY = 'temporary',
  REMOTE = 'remote',
}

export enum JobStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  ON_HOLD = 'on_hold',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum JobPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Application types
export interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  status: ApplicationStatus;
  stage: ApplicationStage;
  cover_letter?: string;
  resume_url?: string;
  applied_at: string;
  updated_at: string;
  interviews?: Interview[];
  evaluations?: Evaluation[];
  notes?: ApplicationNote[];
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  SHORTLISTED = 'shortlisted',
  INTERVIEWING = 'interviewing',
  OFFER_EXTENDED = 'offer_extended',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_DECLINED = 'offer_declined',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export enum ApplicationStage {
  APPLIED = 'applied',
  PHONE_SCREEN = 'phone_screen',
  TECHNICAL_INTERVIEW = 'technical_interview',
  ONSITE_INTERVIEW = 'onsite_interview',
  FINAL_INTERVIEW = 'final_interview',
  REFERENCE_CHECK = 'reference_check',
  OFFER = 'offer',
  HIRED = 'hired',
}

export interface Interview {
  id: string;
  application_id: string;
  type: InterviewType;
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  meeting_url?: string;
  interviewers: string[];
  status: InterviewStatus;
  feedback?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export enum InterviewType {
  PHONE = 'phone',
  VIDEO = 'video',
  ONSITE = 'onsite',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  PANEL = 'panel',
}

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled',
}

export interface Evaluation {
  id: string;
  application_id: string;
  evaluator_id: string;
  criteria: EvaluationCriteria[];
  overall_rating: number;
  recommendation: EvaluationRecommendation;
  comments?: string;
  created_at: string;
}

export interface EvaluationCriteria {
  name: string;
  rating: number;
  max_rating: number;
  comments?: string;
}

export enum EvaluationRecommendation {
  STRONG_YES = 'strong_yes',
  YES = 'yes',
  MAYBE = 'maybe',
  NO = 'no',
  STRONG_NO = 'strong_no',
}

export interface ApplicationNote {
  id: string;
  application_id: string;
  author_id: string;
  content: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Form data types
export interface CandidateFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience_years?: number;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

export interface JobFormData {
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  benefits?: string[];
  priority: JobPriority;
  positions_available: number;
  application_deadline?: string;
}

export interface ApplicationFormData {
  candidate_id: string;
  job_id: string;
  cover_letter?: string;
}

// Dashboard statistics types
export interface DashboardStats {
  total_jobs: number;
  open_jobs: number;
  total_candidates: number;
  total_applications: number;
  applications_this_week: number;
  interviews_scheduled: number;
  offers_extended: number;
  hires_this_month: number;
}

export interface JobMetrics {
  job_id: string;
  total_applications: number;
  applications_by_status: Record<ApplicationStatus, number>;
  average_time_to_hire: number;
  source_breakdown: Record<string, number>;
}

// Filter and search types
export interface CandidateFilters {
  status?: CandidateStatus[];
  skills?: string[];
  experience_min?: number;
  experience_max?: number;
  location?: string;
  search?: string;
}

export interface JobFilters {
  status?: JobStatus[];
  type?: JobType[];
  department?: string;
  location?: string;
  priority?: JobPriority[];
  search?: string;
}

export interface ApplicationFilters {
  status?: ApplicationStatus[];
  stage?: ApplicationStage[];
  job_id?: string;
  candidate_id?: string;
  date_from?: string;
  date_to?: string;
}

// Sorting options
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}
