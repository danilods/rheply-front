import { candidateApiClient } from '@/lib/api-candidate';
import { createFormData } from '@/utils/file-upload';
import {
  ParsedCVResponse,
  ParsedCVData,
  CandidateProfile,
  PaginatedApplications,
  ApplicationDetail,
  TrackedJob,
  TrackedJobInput,
  JobDetail,
  Job,
  Notification,
  JobSearchQuery,
  JobSearchResponse,
  PrivacySettings,
  NotificationPreferences,
  JobAlert,
  JobAlertInput,
} from '@/types/api-responses';
import { ApplicationFilters } from '@/types/index';

// Base API paths
const PATHS = {
  CV: '/candidate/cv',
  PROFILE: '/candidate/profile',
  APPLICATIONS: '/candidate/applications',
  TRACKER: '/candidate/tracker',
  JOBS: '/jobs',
  NOTIFICATIONS: '/candidate/notifications',
  SETTINGS: '/candidate/settings',
  ALERTS: '/candidate/alerts',
};

/**
 * Candidate API Service
 * Provides all API operations for the B2C candidate module
 */
export const candidateApi = {
  // ===========================
  // CV Upload and Parsing
  // ===========================

  /**
   * Upload CV file for parsing
   */
  uploadCV: (file: File, onProgress?: (progress: number) => void) => {
    const formData = createFormData(file);
    return candidateApiClient.uploadFile<ParsedCVResponse>(
      `${PATHS.CV}/upload`,
      formData,
      onProgress
    );
  },

  /**
   * Get CV parsing status
   */
  getCVParsingStatus: (uploadId: string) => {
    return candidateApiClient.get<ParsedCVResponse>(
      `${PATHS.CV}/status/${uploadId}`
    );
  },

  /**
   * Validate parsed CV data before saving
   */
  validateParsedData: (data: ParsedCVData) => {
    return candidateApiClient.post<void>(`${PATHS.CV}/validate`, data);
  },

  /**
   * Save parsed CV data to profile
   */
  saveParsedCVToProfile: (data: ParsedCVData) => {
    return candidateApiClient.post<CandidateProfile>(
      `${PATHS.CV}/save`,
      data
    );
  },

  // ===========================
  // Profile Management
  // ===========================

  /**
   * Get candidate profile
   */
  getProfile: () => {
    return candidateApiClient.get<CandidateProfile>(PATHS.PROFILE);
  },

  /**
   * Update candidate profile
   */
  updateProfile: (data: Partial<CandidateProfile>) => {
    return candidateApiClient.patch<CandidateProfile>(PATHS.PROFILE, data);
  },

  /**
   * Upload profile avatar
   */
  uploadAvatar: (file: File, onProgress?: (progress: number) => void) => {
    const formData = createFormData(file);
    return candidateApiClient.uploadFile<{ avatar_url: string }>(
      `${PATHS.PROFILE}/avatar`,
      formData,
      onProgress
    );
  },

  /**
   * Delete profile avatar
   */
  deleteAvatar: () => {
    return candidateApiClient.delete<void>(`${PATHS.PROFILE}/avatar`);
  },

  /**
   * Download universal CV (generated PDF)
   */
  downloadUniversalCV: () => {
    return candidateApiClient.downloadBlob(`${PATHS.PROFILE}/cv/download`);
  },

  /**
   * Get profile completion percentage
   */
  getProfileCompletion: () => {
    return candidateApiClient.get<{
      percentage: number;
      missing_sections: string[];
      suggestions: string[];
    }>(`${PATHS.PROFILE}/completion`);
  },

  // ===========================
  // Applications
  // ===========================

  /**
   * Get my applications with filters
   */
  getMyApplications: (filters?: ApplicationFilters) => {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.status) {
        filters.status.forEach((s) => params.append('status', s));
      }
      if (filters.stage) {
        filters.stage.forEach((s) => params.append('stage', s));
      }
      if (filters.job_id) params.set('job_id', filters.job_id);
      if (filters.date_from) params.set('date_from', filters.date_from);
      if (filters.date_to) params.set('date_to', filters.date_to);
    }

    const queryString = params.toString();
    const url = queryString
      ? `${PATHS.APPLICATIONS}?${queryString}`
      : PATHS.APPLICATIONS;

    return candidateApiClient.get<PaginatedApplications>(url);
  },

  /**
   * Get single application detail
   */
  getApplicationDetail: (id: string) => {
    return candidateApiClient.get<ApplicationDetail>(
      `${PATHS.APPLICATIONS}/${id}`
    );
  },

  /**
   * Apply to a job
   */
  applyToJob: (jobId: string, coverLetter?: string) => {
    return candidateApiClient.post<ApplicationDetail>(PATHS.APPLICATIONS, {
      job_id: jobId,
      cover_letter: coverLetter,
    });
  },

  /**
   * Withdraw application
   */
  withdrawApplication: (id: string) => {
    return candidateApiClient.delete<void>(`${PATHS.APPLICATIONS}/${id}`);
  },

  /**
   * Add note to application (for candidate's personal tracking)
   */
  addApplicationNote: (id: string, note: string) => {
    return candidateApiClient.post<void>(`${PATHS.APPLICATIONS}/${id}/notes`, {
      note,
    });
  },

  // ===========================
  // Job Tracker (Kanban)
  // ===========================

  /**
   * Get all tracked jobs
   */
  getTrackedJobs: () => {
    return candidateApiClient.get<TrackedJob[]>(PATHS.TRACKER);
  },

  /**
   * Add job to tracker
   */
  addTrackedJob: (job: TrackedJobInput) => {
    return candidateApiClient.post<TrackedJob>(PATHS.TRACKER, job);
  },

  /**
   * Update tracked job status
   */
  updateTrackedJobStatus: (id: string, status: string, position?: number) => {
    return candidateApiClient.patch<TrackedJob>(`${PATHS.TRACKER}/${id}`, {
      status,
      position,
    });
  },

  /**
   * Update tracked job details
   */
  updateTrackedJob: (id: string, data: Partial<TrackedJobInput>) => {
    return candidateApiClient.patch<TrackedJob>(
      `${PATHS.TRACKER}/${id}`,
      data
    );
  },

  /**
   * Delete tracked job
   */
  deleteTrackedJob: (id: string) => {
    return candidateApiClient.delete<void>(`${PATHS.TRACKER}/${id}`);
  },

  /**
   * Reorder tracked jobs within a column
   */
  reorderTrackedJobs: (
    jobs: Array<{ id: string; position: number; status: string }>
  ) => {
    return candidateApiClient.post<void>(`${PATHS.TRACKER}/reorder`, { jobs });
  },

  // ===========================
  // Jobs (Public)
  // ===========================

  /**
   * Search jobs with filters
   */
  searchJobs: (query: JobSearchQuery) => {
    const params = new URLSearchParams();

    if (query.query) params.set('q', query.query);
    if (query.location) params.set('location', query.location);
    if (query.radius_km) params.set('radius_km', query.radius_km.toString());
    if (query.job_types) {
      query.job_types.forEach((t) => params.append('job_type', t));
    }
    if (query.work_modes) {
      query.work_modes.forEach((m) => params.append('work_mode', m));
    }
    if (query.experience_levels) {
      query.experience_levels.forEach((l) =>
        params.append('experience_level', l)
      );
    }
    if (query.salary_min) params.set('salary_min', query.salary_min.toString());
    if (query.salary_max) params.set('salary_max', query.salary_max.toString());
    if (query.skills) {
      query.skills.forEach((s) => params.append('skill', s));
    }
    if (query.industries) {
      query.industries.forEach((i) => params.append('industry', i));
    }
    if (query.company_sizes) {
      query.company_sizes.forEach((s) => params.append('company_size', s));
    }
    if (query.posted_within_days) {
      params.set('posted_within_days', query.posted_within_days.toString());
    }
    if (query.sort_by) params.set('sort_by', query.sort_by);
    if (query.page) params.set('page', query.page.toString());
    if (query.page_size) params.set('page_size', query.page_size.toString());

    return candidateApiClient.get<JobSearchResponse>(
      `${PATHS.JOBS}/search?${params.toString()}`
    );
  },

  /**
   * Get job detail by slug
   */
  getJobDetail: (slug: string) => {
    return candidateApiClient.get<JobDetail>(`${PATHS.JOBS}/${slug}`);
  },

  /**
   * Save a job for later
   */
  saveJob: (jobId: string) => {
    return candidateApiClient.post<void>(`${PATHS.JOBS}/${jobId}/save`);
  },

  /**
   * Remove saved job
   */
  unsaveJob: (jobId: string) => {
    return candidateApiClient.delete<void>(`${PATHS.JOBS}/${jobId}/save`);
  },

  /**
   * Get all saved jobs
   */
  getSavedJobs: () => {
    return candidateApiClient.get<Job[]>(`${PATHS.JOBS}/saved`);
  },

  /**
   * Get similar jobs
   */
  getSimilarJobs: (jobId: string) => {
    return candidateApiClient.get<Job[]>(`${PATHS.JOBS}/${jobId}/similar`);
  },

  /**
   * Get job recommendations based on profile
   */
  getJobRecommendations: () => {
    return candidateApiClient.get<Job[]>(`${PATHS.JOBS}/recommendations`);
  },

  /**
   * Get autocomplete suggestions
   */
  getSearchSuggestions: (query: string) => {
    return candidateApiClient.get<string[]>(
      `${PATHS.JOBS}/suggestions?q=${encodeURIComponent(query)}`
    );
  },

  // ===========================
  // Notifications
  // ===========================

  /**
   * Get all notifications
   */
  getNotifications: (unreadOnly?: boolean) => {
    const url = unreadOnly
      ? `${PATHS.NOTIFICATIONS}?unread=true`
      : PATHS.NOTIFICATIONS;
    return candidateApiClient.get<Notification[]>(url);
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: () => {
    return candidateApiClient.get<{ count: number }>(
      `${PATHS.NOTIFICATIONS}/count`
    );
  },

  /**
   * Mark notification as read
   */
  markAsRead: (id: string) => {
    return candidateApiClient.patch<void>(`${PATHS.NOTIFICATIONS}/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => {
    return candidateApiClient.post<void>(`${PATHS.NOTIFICATIONS}/read-all`);
  },

  /**
   * Delete notification
   */
  deleteNotification: (id: string) => {
    return candidateApiClient.delete<void>(`${PATHS.NOTIFICATIONS}/${id}`);
  },

  // ===========================
  // Settings
  // ===========================

  /**
   * Get privacy settings
   */
  getPrivacySettings: () => {
    return candidateApiClient.get<PrivacySettings>(
      `${PATHS.SETTINGS}/privacy`
    );
  },

  /**
   * Update privacy settings
   */
  updatePrivacySettings: (settings: PrivacySettings) => {
    return candidateApiClient.put<void>(`${PATHS.SETTINGS}/privacy`, settings);
  },

  /**
   * Get notification preferences
   */
  getNotificationPreferences: () => {
    return candidateApiClient.get<NotificationPreferences>(
      `${PATHS.SETTINGS}/notifications`
    );
  },

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: (prefs: NotificationPreferences) => {
    return candidateApiClient.put<void>(
      `${PATHS.SETTINGS}/notifications`,
      prefs
    );
  },

  /**
   * Export all my data (GDPR compliance)
   */
  exportMyData: () => {
    return candidateApiClient.downloadBlob(`${PATHS.SETTINGS}/export`);
  },

  /**
   * Request account deletion
   */
  requestAccountDeletion: () => {
    return candidateApiClient.post<{
      request_id: string;
      scheduled_for: string;
    }>(`${PATHS.SETTINGS}/delete-account`);
  },

  /**
   * Cancel account deletion request
   */
  cancelAccountDeletion: (requestId: string) => {
    return candidateApiClient.delete<void>(
      `${PATHS.SETTINGS}/delete-account/${requestId}`
    );
  },

  // ===========================
  // Job Alerts
  // ===========================

  /**
   * Create a job alert
   */
  createJobAlert: (alert: JobAlertInput) => {
    return candidateApiClient.post<JobAlert>(PATHS.ALERTS, alert);
  },

  /**
   * Get all job alerts
   */
  getJobAlerts: () => {
    return candidateApiClient.get<JobAlert[]>(PATHS.ALERTS);
  },

  /**
   * Update job alert
   */
  updateJobAlert: (id: string, alert: Partial<JobAlertInput>) => {
    return candidateApiClient.patch<JobAlert>(`${PATHS.ALERTS}/${id}`, alert);
  },

  /**
   * Toggle job alert active status
   */
  toggleJobAlert: (id: string, isActive: boolean) => {
    return candidateApiClient.patch<JobAlert>(`${PATHS.ALERTS}/${id}`, {
      is_active: isActive,
    });
  },

  /**
   * Delete job alert
   */
  deleteJobAlert: (id: string) => {
    return candidateApiClient.delete<void>(`${PATHS.ALERTS}/${id}`);
  },

  /**
   * Get job alert matches
   */
  getAlertMatches: (alertId: string) => {
    return candidateApiClient.get<Job[]>(`${PATHS.ALERTS}/${alertId}/matches`);
  },
};

export default candidateApi;
