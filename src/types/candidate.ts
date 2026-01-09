// Candidate User Types
export interface CandidateUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatar?: string;
  isEmailVerified: boolean;
  cvUrl?: string;
  parsedCvId?: string;
  preferences?: CandidatePreferences;
  createdAt: string;
  updatedAt: string;
}

// CV Parsing Types
export interface ParsedCVData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  summary?: string;
  experiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  languages?: Language[];
  certifications?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  confidence: number; // Overall parsing confidence (0-100)
  rawText?: string;
  createdAt: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  achievements: string[];
  confidence: number; // Confidence for this specific extraction (0-100)
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  grade?: string;
  confidence: number;
}

export interface Skill {
  id: string;
  name: string;
  level?: SkillLevel;
  yearsOfExperience?: number;
  confidence: number;
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export interface Language {
  name: string;
  proficiency: LanguageProficiency;
}

export enum LanguageProficiency {
  BASIC = 'basic',
  CONVERSATIONAL = 'conversational',
  FLUENT = 'fluent',
  NATIVE = 'native',
}

// Registration Types
export interface RegistrationSteps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  stepData: {
    step1?: Step1Data;
    step2?: Step2Data;
    step3?: Step3Data;
  };
}

export interface Step1Data {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  lgpdConsent: boolean;
  termsAccepted: boolean;
}

export interface Step2Data {
  cvFile?: File;
  parsedData?: ParsedCVData;
  skipped: boolean;
}

export interface Step3Data {
  areasOfInterest: string[];
  salaryExpectation: SalaryRange;
  availability: Availability;
  openToRelocation: boolean;
  receiveJobAlerts: boolean;
}

// Preferences Types
export interface CandidatePreferences {
  areasOfInterest: string[];
  salaryExpectation: SalaryRange;
  availability: Availability;
  openToRelocation: boolean;
  receiveJobAlerts: boolean;
  preferredJobTypes?: string[];
  preferredLocations?: string[];
  remotePreference?: RemotePreference;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export enum Availability {
  IMMEDIATE = 'immediate',
  FIFTEEN_DAYS = '15_days',
  THIRTY_DAYS = '30_days',
  SIXTY_DAYS = '60_days',
  NINETY_DAYS = '90_days',
}

export enum RemotePreference {
  ONSITE = 'onsite',
  HYBRID = 'hybrid',
  REMOTE = 'remote',
  ANY = 'any',
}

// Upload Types
export interface CVUploadState {
  file: File | null;
  progress: number;
  status: UploadStatus;
  error?: string;
  uploadedUrl?: string;
}

export enum UploadStatus {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  PARSING = 'parsing',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Auth Response Types
export interface CandidateAuthResponse {
  user: CandidateUser;
  token: string;
  refreshToken: string;
}

export interface CandidateLoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Areas of Interest Options
export const AREAS_OF_INTEREST = [
  'Tecnologia da Informacao',
  'Desenvolvimento de Software',
  'Data Science',
  'Marketing Digital',
  'Recursos Humanos',
  'Financas',
  'Vendas',
  'Atendimento ao Cliente',
  'Logistica',
  'Engenharia',
  'Design',
  'Administracao',
  'Saude',
  'Educacao',
  'Juridico',
] as const;

export type AreaOfInterest = typeof AREAS_OF_INTEREST[number];
