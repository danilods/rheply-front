import { useState, useEffect, useCallback, useRef } from 'react';
import { candidateApi } from '@/services/candidate-api';
import {
  Job,
  JobDetail,
  JobSearchQuery,
  JobSearchResponse,
  SuggestedFilter,
} from '@/types/api-responses';
import { STORAGE_KEYS, JOB_SEARCH_DEFAULTS } from '@/constants/candidate';

interface UseJobSearchOptions {
  initialQuery?: JobSearchQuery;
  persistSearchHistory?: boolean;
  maxRecentSearches?: number;
  debounceDelay?: number;
}

interface RecentSearch {
  query: string;
  timestamp: number;
  resultsCount: number;
}

interface UseJobSearchReturn {
  jobs: Job[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  isLoading: boolean;
  error: string | null;
  currentQuery: JobSearchQuery;
  suggestedFilters: SuggestedFilter[];
  recentSearches: RecentSearch[];
  savedJobs: Job[];
  isLoadingSaved: boolean;
  suggestions: string[];
  isLoadingSuggestions: boolean;

  // Actions
  searchJobs: (query: JobSearchQuery) => Promise<void>;
  updateQuery: (updates: Partial<JobSearchQuery>) => void;
  resetQuery: () => void;
  setPage: (page: number) => void;
  saveJob: (jobId: string) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  fetchSavedJobs: () => Promise<void>;
  getJobDetail: (slug: string) => Promise<JobDetail>;
  getSuggestions: (text: string) => Promise<void>;
  clearRecentSearches: () => void;
  applyFilter: (filter: SuggestedFilter) => void;
}

const DEFAULT_OPTIONS: UseJobSearchOptions = {
  persistSearchHistory: true,
  maxRecentSearches: 10,
  debounceDelay: 300,
};

const DEFAULT_QUERY: JobSearchQuery = {
  query: '',
  page: 1,
  page_size: JOB_SEARCH_DEFAULTS.PAGE_SIZE,
  sort_by: 'relevance',
};

export function useJobSearch(
  options: UseJobSearchOptions = {}
): UseJobSearchReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }>({
    total: 0,
    page: 1,
    pageSize: JOB_SEARCH_DEFAULTS.PAGE_SIZE,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<JobSearchQuery>(
    opts.initialQuery || DEFAULT_QUERY
  );
  const [suggestedFilters, setSuggestedFilters] = useState<SuggestedFilter[]>(
    []
  );
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from storage
  const loadRecentSearches = useCallback(() => {
    if (!opts.persistSearchHistory) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      if (stored) {
        const searches = JSON.parse(stored) as RecentSearch[];
        setRecentSearches(searches);
      }
    } catch (err) {
      console.error('Failed to load recent searches:', err);
    }
  }, [opts.persistSearchHistory]);

  // Save recent searches to storage
  const saveRecentSearches = useCallback(
    (searches: RecentSearch[]) => {
      if (!opts.persistSearchHistory) return;

      try {
        localStorage.setItem(
          STORAGE_KEYS.RECENT_SEARCHES,
          JSON.stringify(searches)
        );
      } catch (err) {
        console.error('Failed to save recent searches:', err);
      }
    },
    [opts.persistSearchHistory]
  );

  // Add to recent searches
  const addToRecentSearches = useCallback(
    (query: string, resultsCount: number) => {
      if (!query.trim()) return;

      const newSearch: RecentSearch = {
        query: query.trim(),
        timestamp: Date.now(),
        resultsCount,
      };

      setRecentSearches((prev) => {
        // Remove duplicate if exists
        const filtered = prev.filter(
          (s) => s.query.toLowerCase() !== query.toLowerCase()
        );
        // Add new search at beginning
        const updated = [newSearch, ...filtered].slice(
          0,
          opts.maxRecentSearches
        );
        saveRecentSearches(updated);
        return updated;
      });
    },
    [opts.maxRecentSearches, saveRecentSearches]
  );

  // Search jobs with query
  const searchJobs = useCallback(
    async (query: JobSearchQuery) => {
      setIsLoading(true);
      setError(null);

      try {
        const response: JobSearchResponse = await candidateApi.searchJobs(
          query
        );

        setJobs(response.jobs.items);
        setPagination({
          total: response.total_results,
          page: response.jobs.page,
          pageSize: response.jobs.page_size,
          totalPages: response.jobs.total_pages,
          hasNext: response.jobs.has_next,
          hasPrevious: response.jobs.has_previous,
        });
        setSuggestedFilters(response.suggested_filters || []);
        setCurrentQuery(query);

        // Add to recent searches if there's a query string
        if (query.query) {
          addToRecentSearches(query.query, response.total_results);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to search jobs';
        setError(message);
        console.error('Failed to search jobs:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [addToRecentSearches]
  );

  // Update query with debouncing
  const updateQuery = useCallback(
    (updates: Partial<JobSearchQuery>) => {
      const newQuery = { ...currentQuery, ...updates, page: 1 };
      setCurrentQuery(newQuery);

      // Debounce the search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchJobs(newQuery);
      }, opts.debounceDelay);
    },
    [currentQuery, searchJobs, opts.debounceDelay]
  );

  // Reset query to defaults
  const resetQuery = useCallback(() => {
    setCurrentQuery(DEFAULT_QUERY);
    searchJobs(DEFAULT_QUERY);
  }, [searchJobs]);

  // Set page
  const setPage = useCallback(
    (page: number) => {
      const newQuery = { ...currentQuery, page };
      setCurrentQuery(newQuery);
      searchJobs(newQuery);
    },
    [currentQuery, searchJobs]
  );

  // Save a job
  const saveJob = useCallback(
    async (jobId: string) => {
      try {
        await candidateApi.saveJob(jobId);

        // Update job in list (optimistic update)
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId ? { ...job, is_saved: true } : job
          )
        );

        // Add to saved jobs list if we have it
        const savedJob = jobs.find((j) => j.id === jobId);
        if (savedJob) {
          setSavedJobs((prev) => [{ ...savedJob, is_saved: true }, ...prev]);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to save job';
        setError(message);
        throw err;
      }
    },
    [jobs]
  );

  // Unsave a job
  const unsaveJob = useCallback(async (jobId: string) => {
    try {
      await candidateApi.unsaveJob(jobId);

      // Update job in list (optimistic update)
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, is_saved: false } : job
        )
      );

      // Remove from saved jobs list
      setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to unsave job';
      setError(message);
      throw err;
    }
  }, []);

  // Fetch saved jobs
  const fetchSavedJobs = useCallback(async () => {
    setIsLoadingSaved(true);

    try {
      const saved = await candidateApi.getSavedJobs();
      setSavedJobs(saved);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load saved jobs';
      setError(message);
      console.error('Failed to fetch saved jobs:', err);
    } finally {
      setIsLoadingSaved(false);
    }
  }, []);

  // Get job detail
  const getJobDetail = useCallback(async (slug: string) => {
    try {
      return await candidateApi.getJobDetail(slug);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load job details';
      setError(message);
      throw err;
    }
  }, []);

  // Get autocomplete suggestions
  const getSuggestions = useCallback(async (text: string) => {
    if (!text.trim() || text.length < 2) {
      setSuggestions([]);
      return;
    }

    // Debounce suggestions
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    suggestionsTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);

      try {
        const results = await candidateApi.getSearchSuggestions(text);
        setSuggestions(results);
      } catch (err) {
        console.error('Failed to get suggestions:', err);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 200);
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (opts.persistSearchHistory) {
      localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    }
  }, [opts.persistSearchHistory]);

  // Apply a suggested filter
  const applyFilter = useCallback(
    (filter: SuggestedFilter) => {
      const newQuery = { ...currentQuery };

      switch (filter.type) {
        case 'job_type':
          newQuery.job_types = [
            ...(newQuery.job_types || []),
            filter.value,
          ];
          break;
        case 'work_mode':
          newQuery.work_modes = [
            ...(newQuery.work_modes || []),
            filter.value,
          ];
          break;
        case 'experience_level':
          newQuery.experience_levels = [
            ...(newQuery.experience_levels || []),
            filter.value,
          ];
          break;
        case 'skill':
          newQuery.skills = [...(newQuery.skills || []), filter.value];
          break;
        case 'industry':
          newQuery.industries = [
            ...(newQuery.industries || []),
            filter.value,
          ];
          break;
        default:
          console.warn('Unknown filter type:', filter.type);
      }

      updateQuery(newQuery);
    },
    [currentQuery, updateQuery]
  );

  // Initial load
  useEffect(() => {
    loadRecentSearches();

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [loadRecentSearches]);

  return {
    jobs,
    pagination,
    isLoading,
    error,
    currentQuery,
    suggestedFilters,
    recentSearches,
    savedJobs,
    isLoadingSaved,
    suggestions,
    isLoadingSuggestions,
    searchJobs,
    updateQuery,
    resetQuery,
    setPage,
    saveJob,
    unsaveJob,
    fetchSavedJobs,
    getJobDetail,
    getSuggestions,
    clearRecentSearches,
    applyFilter,
  };
}

export default useJobSearch;
