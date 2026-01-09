import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Candidate Profile Types
export interface CandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  headline?: string;
  location?: string;
  avatar?: string;
  summary?: string;
  isProfileVisible: boolean;
  linkedInConnected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  skills: string[];
  achievements: string[];
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
}

export interface Skill {
  id: string;
  name: string;
  proficiency: number; // 1-5
}

export interface Language {
  id: string;
  name: string;
  proficiency: "basico" | "intermediario" | "avancado" | "fluente" | "nativo";
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
}

// Application Types
export interface CandidateApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  appliedAt: string;
  updatedAt: string;
  status: "enviada" | "em_analise" | "entrevista" | "proposta" | "rejeitada" | "contratada";
  matchScore: number;
  timeline: ApplicationTimelineStep[];
  interviewDetails?: InterviewDetails;
  feedback?: string;
  documents: string[];
}

export interface ApplicationTimelineStep {
  id: string;
  title: string;
  description?: string;
  completedAt?: string;
  isCurrent: boolean;
}

export interface InterviewDetails {
  date: string;
  time: string;
  type: "video" | "phone" | "presencial";
  meetingUrl?: string;
  location?: string;
  notes?: string;
}

// Kanban Job Tracker Types
export interface TrackedJob {
  id: string;
  title: string;
  company: string;
  url?: string;
  source: string; // LinkedIn, Gupy, Indeed, etc.
  dateAdded: string;
  notes?: string;
  salary?: string;
  location?: string;
  column: "interessado" | "aplicado" | "entrevista" | "proposta" | "rejeitado";
}

// Notification Types
export interface Notification {
  id: string;
  type: "application_update" | "interview_scheduled" | "profile_view" | "recommendation" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Stats Types
export interface CandidateStats {
  applicationsSent: number;
  profileViews: number;
  interviewInvitations: number;
  averageMatchScore: number;
}

// Recommended Job Type
export interface RecommendedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  matchScore: number;
  postedAt: string;
  skills: string[];
}

// Store State
interface CandidateState {
  // Profile
  profile: CandidateProfile | null;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  projects: Project[];

  // Applications
  applications: CandidateApplication[];

  // Job Tracker (Kanban)
  trackedJobs: TrackedJob[];

  // Notifications
  notifications: Notification[];
  unreadNotificationsCount: number;

  // Stats
  stats: CandidateStats;

  // Recommended Jobs
  recommendedJobs: RecommendedJob[];

  // UI State
  isLoading: boolean;
  error: string | null;
}

interface CandidateActions {
  // Profile Actions
  setProfile: (profile: CandidateProfile) => void;
  updateProfile: (updates: Partial<CandidateProfile>) => void;
  toggleProfileVisibility: () => void;

  // Experience Actions
  addExperience: (experience: Experience) => void;
  updateExperience: (id: string, updates: Partial<Experience>) => void;
  deleteExperience: (id: string) => void;

  // Education Actions
  addEducation: (education: Education) => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  deleteEducation: (id: string) => void;

  // Skill Actions
  addSkill: (skill: Skill) => void;
  updateSkillProficiency: (id: string, proficiency: number) => void;
  deleteSkill: (id: string) => void;

  // Language Actions
  addLanguage: (language: Language) => void;
  updateLanguageProficiency: (id: string, proficiency: Language["proficiency"]) => void;
  deleteLanguage: (id: string) => void;

  // Certification Actions
  addCertification: (certification: Certification) => void;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;

  // Project Actions
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Application Actions
  setApplications: (applications: CandidateApplication[]) => void;
  updateApplicationStatus: (id: string, status: CandidateApplication["status"]) => void;

  // Tracked Jobs Actions (Kanban)
  addTrackedJob: (job: TrackedJob) => void;
  updateTrackedJob: (id: string, updates: Partial<TrackedJob>) => void;
  deleteTrackedJob: (id: string) => void;
  moveTrackedJob: (id: string, column: TrackedJob["column"]) => void;

  // Notification Actions
  setNotifications: (notifications: Notification[]) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Stats Actions
  setStats: (stats: CandidateStats) => void;

  // Recommended Jobs Actions
  setRecommendedJobs: (jobs: RecommendedJob[]) => void;

  // Utility Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  getProfileCompletionPercentage: () => number;
  getMissingProfileItems: () => string[];
}

type CandidateStore = CandidateState & CandidateActions;

const initialState: CandidateState = {
  profile: null,
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  projects: [],
  applications: [],
  trackedJobs: [],
  notifications: [],
  unreadNotificationsCount: 0,
  stats: {
    applicationsSent: 0,
    profileViews: 0,
    interviewInvitations: 0,
    averageMatchScore: 0,
  },
  recommendedJobs: [],
  isLoading: false,
  error: null,
};

export const useCandidateStore = create<CandidateStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Profile Actions
      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...updates, updatedAt: new Date().toISOString() }
            : null,
        })),

      toggleProfileVisibility: () =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, isProfileVisible: !state.profile.isProfileVisible }
            : null,
        })),

      // Experience Actions
      addExperience: (experience) =>
        set((state) => ({ experiences: [...state.experiences, experience] })),

      updateExperience: (id, updates) =>
        set((state) => ({
          experiences: state.experiences.map((exp) =>
            exp.id === id ? { ...exp, ...updates } : exp
          ),
        })),

      deleteExperience: (id) =>
        set((state) => ({
          experiences: state.experiences.filter((exp) => exp.id !== id),
        })),

      // Education Actions
      addEducation: (education) =>
        set((state) => ({ education: [...state.education, education] })),

      updateEducation: (id, updates) =>
        set((state) => ({
          education: state.education.map((edu) =>
            edu.id === id ? { ...edu, ...updates } : edu
          ),
        })),

      deleteEducation: (id) =>
        set((state) => ({
          education: state.education.filter((edu) => edu.id !== id),
        })),

      // Skill Actions
      addSkill: (skill) => set((state) => ({ skills: [...state.skills, skill] })),

      updateSkillProficiency: (id, proficiency) =>
        set((state) => ({
          skills: state.skills.map((skill) =>
            skill.id === id ? { ...skill, proficiency } : skill
          ),
        })),

      deleteSkill: (id) =>
        set((state) => ({ skills: state.skills.filter((skill) => skill.id !== id) })),

      // Language Actions
      addLanguage: (language) =>
        set((state) => ({ languages: [...state.languages, language] })),

      updateLanguageProficiency: (id, proficiency) =>
        set((state) => ({
          languages: state.languages.map((lang) =>
            lang.id === id ? { ...lang, proficiency } : lang
          ),
        })),

      deleteLanguage: (id) =>
        set((state) => ({
          languages: state.languages.filter((lang) => lang.id !== id),
        })),

      // Certification Actions
      addCertification: (certification) =>
        set((state) => ({
          certifications: [...state.certifications, certification],
        })),

      updateCertification: (id, updates) =>
        set((state) => ({
          certifications: state.certifications.map((cert) =>
            cert.id === id ? { ...cert, ...updates } : cert
          ),
        })),

      deleteCertification: (id) =>
        set((state) => ({
          certifications: state.certifications.filter((cert) => cert.id !== id),
        })),

      // Project Actions
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === id ? { ...proj, ...updates } : proj
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((proj) => proj.id !== id),
        })),

      // Application Actions
      setApplications: (applications) => set({ applications }),

      updateApplicationStatus: (id, status) =>
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id ? { ...app, status, updatedAt: new Date().toISOString() } : app
          ),
        })),

      // Tracked Jobs Actions
      addTrackedJob: (job) =>
        set((state) => ({ trackedJobs: [...state.trackedJobs, job] })),

      updateTrackedJob: (id, updates) =>
        set((state) => ({
          trackedJobs: state.trackedJobs.map((job) =>
            job.id === id ? { ...job, ...updates } : job
          ),
        })),

      deleteTrackedJob: (id) =>
        set((state) => ({
          trackedJobs: state.trackedJobs.filter((job) => job.id !== id),
        })),

      moveTrackedJob: (id, column) =>
        set((state) => ({
          trackedJobs: state.trackedJobs.map((job) =>
            job.id === id ? { ...job, column } : job
          ),
        })),

      // Notification Actions
      setNotifications: (notifications) =>
        set({
          notifications,
          unreadNotificationsCount: notifications.filter((n) => !n.read).length,
        }),

      markNotificationAsRead: (id) =>
        set((state) => {
          const updatedNotifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          return {
            notifications: updatedNotifications,
            unreadNotificationsCount: updatedNotifications.filter((n) => !n.read).length,
          };
        }),

      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadNotificationsCount: 0,
        })),

      // Stats Actions
      setStats: (stats) => set({ stats }),

      // Recommended Jobs Actions
      setRecommendedJobs: (jobs) => set({ recommendedJobs: jobs }),

      // Utility Actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      getProfileCompletionPercentage: () => {
        const state = get();
        let completed = 0;
        let total = 10;

        if (state.profile?.firstName && state.profile?.lastName) completed++;
        if (state.profile?.headline) completed++;
        if (state.profile?.summary) completed++;
        if (state.profile?.avatar) completed++;
        if (state.experiences.length > 0) completed++;
        if (state.education.length > 0) completed++;
        if (state.skills.length >= 3) completed++;
        if (state.languages.length > 0) completed++;
        if (state.certifications.length > 0) completed++;
        if (state.projects.length > 0) completed++;

        return Math.round((completed / total) * 100);
      },

      getMissingProfileItems: () => {
        const state = get();
        const missing: string[] = [];

        if (!state.profile?.firstName || !state.profile?.lastName) {
          missing.push("Nome completo");
        }
        if (!state.profile?.headline) {
          missing.push("Titulo profissional");
        }
        if (!state.profile?.summary) {
          missing.push("Resumo profissional");
        }
        if (!state.profile?.avatar) {
          missing.push("Foto de perfil");
        }
        if (state.experiences.length === 0) {
          missing.push("Experiencia profissional");
        }
        if (state.education.length === 0) {
          missing.push("Formacao academica");
        }
        if (state.skills.length < 3) {
          missing.push("Pelo menos 3 habilidades");
        }
        if (state.languages.length === 0) {
          missing.push("Idiomas");
        }
        if (state.certifications.length === 0) {
          missing.push("Certificacoes");
        }
        if (state.projects.length === 0) {
          missing.push("Projetos/Portfolio");
        }

        return missing;
      },
    }),
    {
      name: "candidate-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        profile: state.profile,
        experiences: state.experiences,
        education: state.education,
        skills: state.skills,
        languages: state.languages,
        certifications: state.certifications,
        projects: state.projects,
        trackedJobs: state.trackedJobs,
      }),
    }
  )
);
