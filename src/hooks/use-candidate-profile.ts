import { useState, useEffect, useCallback, useRef } from 'react';
import { candidateApi } from '@/services/candidate-api';
import { CandidateProfile } from '@/types/api-responses';
import { STORAGE_KEYS } from '@/constants/candidate';
import { calculateProfileCompleteness, getProfileImprovementSuggestions } from '@/utils/cv-generator';

interface UseCandidateProfileOptions {
  autoSaveDraft?: boolean;
  autoSaveInterval?: number; // milliseconds
}

interface UseCandidateProfileReturn {
  profile: CandidateProfile | null;
  isLoading: boolean;
  error: string | null;
  completionPercentage: number;
  missingSections: string[];
  suggestions: string[];
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<CandidateProfile>) => Promise<void>;
  updateField: <K extends keyof CandidateProfile>(
    field: K,
    value: CandidateProfile[K]
  ) => void;
  saveDraft: () => void;
  loadDraft: () => Partial<CandidateProfile> | null;
  clearDraft: () => void;
  uploadAvatar: (file: File) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  resetChanges: () => void;
}

const DEFAULT_OPTIONS: UseCandidateProfileOptions = {
  autoSaveDraft: true,
  autoSaveInterval: 30000, // 30 seconds
};

export function useCandidateProfile(
  options: UseCandidateProfileOptions = {}
): UseCandidateProfileReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate profile completeness
  const { score: completionPercentage, missing: missingSections } = profile
    ? calculateProfileCompleteness(profile)
    : { score: 0, missing: [] };

  const suggestions = profile ? getProfileImprovementSuggestions(profile) : [];

  // Fetch profile from API
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await candidateApi.getProfile();
      setProfile(data);
      setOriginalProfile(data);
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile on server
  const updateProfile = useCallback(
    async (data: Partial<CandidateProfile>) => {
      if (!profile) return;

      setIsSaving(true);
      setError(null);

      try {
        const updatedProfile = await candidateApi.updateProfile(data);
        setProfile(updatedProfile);
        setOriginalProfile(updatedProfile);
        setIsDirty(false);
        setLastSaved(new Date());
        clearDraft();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update profile';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [profile]
  );

  // Update a single field locally
  const updateField = useCallback(
    <K extends keyof CandidateProfile>(
      field: K,
      value: CandidateProfile[K]
    ) => {
      if (!profile) return;

      setProfile((prev) => {
        if (!prev) return prev;
        return { ...prev, [field]: value };
      });
      setIsDirty(true);
    },
    [profile]
  );

  // Save draft to local storage
  const saveDraft = useCallback(() => {
    if (!profile || !isDirty) return;

    try {
      const draftData = {
        profile,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.DRAFT_PROFILE, JSON.stringify(draftData));
      console.debug('[Profile] Draft saved');
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  }, [profile, isDirty]);

  // Load draft from local storage
  const loadDraft = useCallback((): Partial<CandidateProfile> | null => {
    try {
      const draftJson = localStorage.getItem(STORAGE_KEYS.DRAFT_PROFILE);
      if (!draftJson) return null;

      const draftData = JSON.parse(draftJson);
      return draftData.profile;
    } catch (err) {
      console.error('Failed to load draft:', err);
      return null;
    }
  }, []);

  // Clear draft from local storage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_PROFILE);
    } catch (err) {
      console.error('Failed to clear draft:', err);
    }
  }, []);

  // Upload avatar
  const uploadAvatar = useCallback(
    async (file: File) => {
      setIsSaving(true);
      setError(null);

      try {
        const { avatar_url } = await candidateApi.uploadAvatar(file);

        setProfile((prev) => {
          if (!prev) return prev;
          return { ...prev, avatar_url };
        });
        setLastSaved(new Date());
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to upload avatar';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  // Delete avatar
  const deleteAvatar = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      await candidateApi.deleteAvatar();

      setProfile((prev) => {
        if (!prev) return prev;
        return { ...prev, avatar_url: undefined };
      });
      setLastSaved(new Date());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete avatar';
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Reset changes to original profile
  const resetChanges = useCallback(() => {
    if (originalProfile) {
      setProfile(originalProfile);
      setIsDirty(false);
      clearDraft();
    }
  }, [originalProfile, clearDraft]);

  // Auto-save draft when profile changes
  useEffect(() => {
    if (!opts.autoSaveDraft || !isDirty) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft();
    }, opts.autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [profile, isDirty, opts.autoSaveDraft, opts.autoSaveInterval, saveDraft]);

  // Initial fetch
  useEffect(() => {
    fetchProfile();

    // Cleanup on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [fetchProfile]);

  // Check for unsaved draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && !profile) {
      console.debug('[Profile] Found unsaved draft');
      // Optionally prompt user to restore draft
    }
  }, [loadDraft, profile]);

  return {
    profile,
    isLoading,
    error,
    completionPercentage,
    missingSections,
    suggestions,
    isDirty,
    isSaving,
    lastSaved,
    fetchProfile,
    updateProfile,
    updateField,
    saveDraft,
    loadDraft,
    clearDraft,
    uploadAvatar,
    deleteAvatar,
    resetChanges,
  };
}

export default useCandidateProfile;
