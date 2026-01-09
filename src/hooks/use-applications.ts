import { useState, useEffect, useCallback, useRef } from 'react';
import { candidateApi } from '@/services/candidate-api';
import {
  ApplicationDetail,
  PaginatedApplications,
} from '@/types/api-responses';
import { ApplicationFilters } from '@/types/index';
import { getWebSocketClient } from '@/lib/websocket';
import { WS_EVENTS } from '@/constants/candidate';

interface UseApplicationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  enableRealTime?: boolean;
}

interface UseApplicationsReturn {
  applications: ApplicationDetail[];
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
  currentApplication: ApplicationDetail | null;
  isLoadingDetail: boolean;

  // Actions
  fetchApplications: (filters?: ApplicationFilters) => Promise<void>;
  fetchApplicationDetail: (id: string) => Promise<void>;
  applyToJob: (
    jobId: string,
    coverLetter?: string
  ) => Promise<ApplicationDetail>;
  withdrawApplication: (id: string) => Promise<void>;
  addNote: (applicationId: string, note: string) => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: ApplicationFilters) => void;
  clearFilters: () => void;
  refreshApplications: () => Promise<void>;
}

const DEFAULT_OPTIONS: UseApplicationsOptions = {
  autoRefresh: false,
  refreshInterval: 60000, // 1 minute
  enableRealTime: true,
};

export function useApplications(
  options: UseApplicationsOptions = {}
): UseApplicationsReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [applications, setApplications] = useState<ApplicationDetail[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [filters, setFiltersState] = useState<ApplicationFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentApplication, setCurrentApplication] =
    useState<ApplicationDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wsUnsubscribeRef = useRef<(() => void) | null>(null);

  // Fetch applications with filters
  const fetchApplications = useCallback(
    async (customFilters?: ApplicationFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        const filtersToUse = customFilters || filters;
        const response: PaginatedApplications =
          await candidateApi.getMyApplications(filtersToUse);

        setApplications(response.items);
        setPagination({
          total: response.total,
          page: response.page,
          pageSize: response.page_size,
          totalPages: response.total_pages,
          hasNext: response.has_next,
          hasPrevious: response.has_previous,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load applications';
        setError(message);
        console.error('Failed to fetch applications:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  // Fetch single application detail
  const fetchApplicationDetail = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    setError(null);

    try {
      const detail = await candidateApi.getApplicationDetail(id);
      setCurrentApplication(detail);

      // Update in list if exists
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? detail : app))
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load application details';
      setError(message);
      console.error('Failed to fetch application detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // Apply to a job
  const applyToJob = useCallback(
    async (jobId: string, coverLetter?: string) => {
      setError(null);

      try {
        const newApplication = await candidateApi.applyToJob(
          jobId,
          coverLetter
        );

        // Add to beginning of list (optimistic update)
        setApplications((prev) => [newApplication, ...prev]);
        setPagination((prev) => ({
          ...prev,
          total: prev.total + 1,
        }));

        return newApplication;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to apply to job';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Withdraw an application
  const withdrawApplication = useCallback(async (id: string) => {
    setError(null);

    try {
      await candidateApi.withdrawApplication(id);

      // Remove from list (optimistic update)
      setApplications((prev) => prev.filter((app) => app.id !== id));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));

      // Clear current if it's the one being withdrawn
      if (currentApplication?.id === id) {
        setCurrentApplication(null);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to withdraw application';
      setError(message);
      throw err;
    }
  }, [currentApplication]);

  // Add note to application
  const addNote = useCallback(async (applicationId: string, note: string) => {
    setError(null);

    try {
      await candidateApi.addApplicationNote(applicationId, note);
      // Refresh the application detail to get updated notes
      await fetchApplicationDetail(applicationId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add note';
      setError(message);
      throw err;
    }
  }, [fetchApplicationDetail]);

  // Set current page
  const setPage = useCallback(
    (page: number) => {
      setPagination((prev) => ({ ...prev, page }));
      // Refetch with new page (would need to include page in filters)
      fetchApplications({ ...filters, page } as ApplicationFilters & {
        page: number;
      });
    },
    [filters, fetchApplications]
  );

  // Set filters
  const setFilters = useCallback(
    (newFilters: ApplicationFilters) => {
      setFiltersState(newFilters);
      fetchApplications(newFilters);
    },
    [fetchApplications]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFiltersState({});
    fetchApplications({});
  }, [fetchApplications]);

  // Refresh applications
  const refreshApplications = useCallback(async () => {
    await fetchApplications();
  }, [fetchApplications]);

  // Handle real-time application updates
  const handleApplicationUpdate = useCallback(
    (data: unknown) => {
      const update = data as {
        application_id: string;
        status: string;
        stage?: string;
      };

      setApplications((prev) =>
        prev.map((app) => {
          if (app.id === update.application_id) {
            return {
              ...app,
              status: update.status as ApplicationDetail['status'],
              stage: update.stage || app.stage,
              updated_at: new Date().toISOString(),
            };
          }
          return app;
        })
      );

      // Update current application if it's the one being updated
      if (currentApplication?.id === update.application_id) {
        setCurrentApplication((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: update.status as ApplicationDetail['status'],
            stage: update.stage || prev.stage,
            updated_at: new Date().toISOString(),
          };
        });
      }
    },
    [currentApplication]
  );

  // Setup real-time updates
  useEffect(() => {
    if (!opts.enableRealTime) return;

    const wsClient = getWebSocketClient();
    wsClient.connect();

    wsUnsubscribeRef.current = wsClient.on(
      WS_EVENTS.APPLICATION_UPDATE,
      handleApplicationUpdate
    );

    return () => {
      if (wsUnsubscribeRef.current) {
        wsUnsubscribeRef.current();
      }
    };
  }, [opts.enableRealTime, handleApplicationUpdate]);

  // Setup auto-refresh
  useEffect(() => {
    if (!opts.autoRefresh) return;

    refreshTimerRef.current = setInterval(() => {
      fetchApplications();
    }, opts.refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [opts.autoRefresh, opts.refreshInterval, fetchApplications]);

  // Initial fetch
  useEffect(() => {
    fetchApplications();

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [fetchApplications]);

  return {
    applications,
    pagination,
    isLoading,
    error,
    currentApplication,
    isLoadingDetail,
    fetchApplications,
    fetchApplicationDetail,
    applyToJob,
    withdrawApplication,
    addNote,
    setPage,
    setFilters,
    clearFilters,
    refreshApplications,
  };
}

export default useApplications;
