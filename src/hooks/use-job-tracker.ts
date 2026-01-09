import { useState, useEffect, useCallback, useRef } from 'react';
import { candidateApi } from '@/services/candidate-api';
import { TrackedJob, TrackedJobInput } from '@/types/api-responses';
import {
  KANBAN_COLUMNS,
  KanbanColumnValue,
  STORAGE_KEYS,
} from '@/constants/candidate';

interface UseJobTrackerOptions {
  syncWithServer?: boolean;
  localStorageBackup?: boolean;
  autoSaveInterval?: number;
}

interface KanbanColumn {
  id: KanbanColumnValue;
  title: string;
  jobs: TrackedJob[];
}

interface UseJobTrackerReturn {
  trackedJobs: TrackedJob[];
  columns: KanbanColumn[];
  isLoading: boolean;
  error: string | null;
  isSyncing: boolean;
  lastSynced: Date | null;

  // Actions
  fetchTrackedJobs: () => Promise<void>;
  addJob: (job: TrackedJobInput) => Promise<TrackedJob>;
  updateJobStatus: (
    jobId: string,
    newStatus: KanbanColumnValue,
    newPosition?: number
  ) => Promise<void>;
  updateJob: (jobId: string, data: Partial<TrackedJobInput>) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  moveJob: (
    jobId: string,
    sourceColumn: KanbanColumnValue,
    targetColumn: KanbanColumnValue,
    newIndex: number
  ) => Promise<void>;
  reorderInColumn: (
    column: KanbanColumnValue,
    jobId: string,
    newIndex: number
  ) => Promise<void>;
  syncWithServer: () => Promise<void>;
  getJobsByStatus: (status: KanbanColumnValue) => TrackedJob[];
  getStats: () => {
    total: number;
    byStatus: Record<KanbanColumnValue, number>;
  };
}

const DEFAULT_OPTIONS: UseJobTrackerOptions = {
  syncWithServer: true,
  localStorageBackup: true,
  autoSaveInterval: 60000, // 1 minute
};

export function useJobTracker(
  options: UseJobTrackerOptions = {}
): UseJobTrackerReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<boolean>(false);

  // Organize jobs into Kanban columns
  const columns: KanbanColumn[] = Object.values(KANBAN_COLUMNS).map(
    (columnId) => ({
      id: columnId,
      title: columnId.charAt(0).toUpperCase() + columnId.slice(1),
      jobs: trackedJobs
        .filter((job) => job.status === columnId)
        .sort((a, b) => a.position - b.position),
    })
  );

  // Save to local storage
  const saveToLocalStorage = useCallback(() => {
    if (!opts.localStorageBackup) return;

    try {
      const data = {
        jobs: trackedJobs,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.TRACKED_JOBS, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save to local storage:', err);
    }
  }, [trackedJobs, opts.localStorageBackup]);

  // Load from local storage
  const loadFromLocalStorage = useCallback((): TrackedJob[] | null => {
    if (!opts.localStorageBackup) return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRACKED_JOBS);
      if (stored) {
        const data = JSON.parse(stored);
        return data.jobs;
      }
    } catch (err) {
      console.error('Failed to load from local storage:', err);
    }
    return null;
  }, [opts.localStorageBackup]);

  // Fetch tracked jobs from server
  const fetchTrackedJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (opts.syncWithServer) {
        const jobs = await candidateApi.getTrackedJobs();
        setTrackedJobs(jobs);
        setLastSynced(new Date());
        saveToLocalStorage();
      } else {
        // Load from local storage only
        const localJobs = loadFromLocalStorage();
        if (localJobs) {
          setTrackedJobs(localJobs);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load tracked jobs';
      setError(message);

      // Fallback to local storage
      const localJobs = loadFromLocalStorage();
      if (localJobs) {
        setTrackedJobs(localJobs);
        console.warn('Using locally cached tracked jobs');
      }
    } finally {
      setIsLoading(false);
    }
  }, [opts.syncWithServer, saveToLocalStorage, loadFromLocalStorage]);

  // Add a new job to tracker
  const addJob = useCallback(
    async (jobInput: TrackedJobInput) => {
      setError(null);

      // Set default status and position
      const status = jobInput.status || KANBAN_COLUMNS.WISHLIST;
      const jobsInColumn = trackedJobs.filter((j) => j.status === status);
      const position = jobsInColumn.length;

      const tempId = `temp_${Date.now()}`;
      const tempJob: TrackedJob = {
        id: tempId,
        ...jobInput,
        status,
        position,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistic update
      setTrackedJobs((prev) => [...prev, tempJob]);
      pendingChangesRef.current = true;

      try {
        if (opts.syncWithServer) {
          const newJob = await candidateApi.addTrackedJob({
            ...jobInput,
            status,
          });
          // Replace temp job with server response
          setTrackedJobs((prev) =>
            prev.map((job) => (job.id === tempId ? newJob : job))
          );
          saveToLocalStorage();
          return newJob;
        }

        saveToLocalStorage();
        return tempJob;
      } catch (err) {
        // Rollback on error
        setTrackedJobs((prev) => prev.filter((job) => job.id !== tempId));
        const message =
          err instanceof Error ? err.message : 'Failed to add job';
        setError(message);
        throw err;
      }
    },
    [trackedJobs, opts.syncWithServer, saveToLocalStorage]
  );

  // Update job status (for drag & drop)
  const updateJobStatus = useCallback(
    async (
      jobId: string,
      newStatus: KanbanColumnValue,
      newPosition?: number
    ) => {
      setError(null);

      const oldJobs = [...trackedJobs];
      const jobIndex = trackedJobs.findIndex((j) => j.id === jobId);
      if (jobIndex === -1) return;

      const job = trackedJobs[jobIndex];
      const oldStatus = job.status;

      // Calculate new position if not provided
      const targetColumnJobs = trackedJobs.filter(
        (j) => j.status === newStatus && j.id !== jobId
      );
      const position =
        newPosition !== undefined ? newPosition : targetColumnJobs.length;

      // Optimistic update
      setTrackedJobs((prev) => {
        const updated = prev.map((j) => {
          if (j.id === jobId) {
            return {
              ...j,
              status: newStatus,
              position,
              updated_at: new Date().toISOString(),
            };
          }
          // Adjust positions in target column
          if (
            j.status === newStatus &&
            j.id !== jobId &&
            j.position >= position
          ) {
            return { ...j, position: j.position + 1 };
          }
          // Adjust positions in source column
          if (
            j.status === oldStatus &&
            j.id !== jobId &&
            j.position > job.position
          ) {
            return { ...j, position: j.position - 1 };
          }
          return j;
        });
        return updated;
      });

      pendingChangesRef.current = true;

      try {
        if (opts.syncWithServer) {
          await candidateApi.updateTrackedJobStatus(jobId, newStatus, position);
          saveToLocalStorage();
        } else {
          saveToLocalStorage();
        }
      } catch (err) {
        // Rollback on error
        setTrackedJobs(oldJobs);
        const message =
          err instanceof Error ? err.message : 'Failed to update job status';
        setError(message);
        throw err;
      }
    },
    [trackedJobs, opts.syncWithServer, saveToLocalStorage]
  );

  // Update job details
  const updateJob = useCallback(
    async (jobId: string, data: Partial<TrackedJobInput>) => {
      setError(null);

      const oldJobs = [...trackedJobs];

      // Optimistic update
      setTrackedJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, ...data, updated_at: new Date().toISOString() }
            : job
        )
      );

      pendingChangesRef.current = true;

      try {
        if (opts.syncWithServer) {
          await candidateApi.updateTrackedJob(jobId, data);
          saveToLocalStorage();
        } else {
          saveToLocalStorage();
        }
      } catch (err) {
        // Rollback on error
        setTrackedJobs(oldJobs);
        const message =
          err instanceof Error ? err.message : 'Failed to update job';
        setError(message);
        throw err;
      }
    },
    [trackedJobs, opts.syncWithServer, saveToLocalStorage]
  );

  // Delete a job
  const deleteJob = useCallback(
    async (jobId: string) => {
      setError(null);

      const oldJobs = [...trackedJobs];
      const jobToDelete = trackedJobs.find((j) => j.id === jobId);

      if (!jobToDelete) return;

      // Optimistic update
      setTrackedJobs((prev) => {
        const updated = prev
          .filter((job) => job.id !== jobId)
          .map((job) => {
            // Adjust positions in the same column
            if (
              job.status === jobToDelete.status &&
              job.position > jobToDelete.position
            ) {
              return { ...job, position: job.position - 1 };
            }
            return job;
          });
        return updated;
      });

      pendingChangesRef.current = true;

      try {
        if (opts.syncWithServer) {
          await candidateApi.deleteTrackedJob(jobId);
          saveToLocalStorage();
        } else {
          saveToLocalStorage();
        }
      } catch (err) {
        // Rollback on error
        setTrackedJobs(oldJobs);
        const message =
          err instanceof Error ? err.message : 'Failed to delete job';
        setError(message);
        throw err;
      }
    },
    [trackedJobs, opts.syncWithServer, saveToLocalStorage]
  );

  // Move job between columns
  const moveJob = useCallback(
    async (
      jobId: string,
      _sourceColumn: KanbanColumnValue,
      targetColumn: KanbanColumnValue,
      newIndex: number
    ) => {
      await updateJobStatus(jobId, targetColumn, newIndex);
    },
    [updateJobStatus]
  );

  // Reorder job within the same column
  const reorderInColumn = useCallback(
    async (
      column: KanbanColumnValue,
      jobId: string,
      newIndex: number
    ) => {
      setError(null);

      const oldJobs = [...trackedJobs];
      const columnJobs = trackedJobs
        .filter((j) => j.status === column)
        .sort((a, b) => a.position - b.position);

      const jobIndex = columnJobs.findIndex((j) => j.id === jobId);
      if (jobIndex === -1) return;

      // Remove job from current position
      const [movedJob] = columnJobs.splice(jobIndex, 1);
      // Insert at new position
      columnJobs.splice(newIndex, 0, movedJob);

      // Update positions
      const updatedJobs = columnJobs.map((job, index) => ({
        ...job,
        position: index,
        updated_at: new Date().toISOString(),
      }));

      // Update state
      setTrackedJobs((prev) => {
        const otherJobs = prev.filter((j) => j.status !== column);
        return [...otherJobs, ...updatedJobs];
      });

      pendingChangesRef.current = true;

      try {
        if (opts.syncWithServer) {
          const reorderData = updatedJobs.map((job) => ({
            id: job.id,
            position: job.position,
            status: job.status,
          }));
          await candidateApi.reorderTrackedJobs(reorderData);
          saveToLocalStorage();
        } else {
          saveToLocalStorage();
        }
      } catch (err) {
        // Rollback on error
        setTrackedJobs(oldJobs);
        const message =
          err instanceof Error ? err.message : 'Failed to reorder jobs';
        setError(message);
        throw err;
      }
    },
    [trackedJobs, opts.syncWithServer, saveToLocalStorage]
  );

  // Sync with server
  const syncWithServer = useCallback(async () => {
    if (!opts.syncWithServer) return;

    setIsSyncing(true);

    try {
      const jobs = await candidateApi.getTrackedJobs();
      setTrackedJobs(jobs);
      setLastSynced(new Date());
      pendingChangesRef.current = false;
      saveToLocalStorage();
    } catch (err) {
      console.error('Failed to sync with server:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [opts.syncWithServer, saveToLocalStorage]);

  // Get jobs by status
  const getJobsByStatus = useCallback(
    (status: KanbanColumnValue) => {
      return trackedJobs
        .filter((job) => job.status === status)
        .sort((a, b) => a.position - b.position);
    },
    [trackedJobs]
  );

  // Get statistics
  const getStats = useCallback(() => {
    const byStatus = Object.values(KANBAN_COLUMNS).reduce(
      (acc, status) => {
        acc[status] = trackedJobs.filter((j) => j.status === status).length;
        return acc;
      },
      {} as Record<KanbanColumnValue, number>
    );

    return {
      total: trackedJobs.length,
      byStatus,
    };
  }, [trackedJobs]);

  // Auto-sync with server
  useEffect(() => {
    if (!opts.syncWithServer || !opts.autoSaveInterval) return;

    syncTimerRef.current = setInterval(() => {
      if (pendingChangesRef.current) {
        syncWithServer();
      }
    }, opts.autoSaveInterval);

    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [opts.syncWithServer, opts.autoSaveInterval, syncWithServer]);

  // Initial load
  useEffect(() => {
    fetchTrackedJobs();

    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [fetchTrackedJobs]);

  // Save to local storage when jobs change
  useEffect(() => {
    if (trackedJobs.length > 0) {
      saveToLocalStorage();
    }
  }, [trackedJobs, saveToLocalStorage]);

  return {
    trackedJobs,
    columns,
    isLoading,
    error,
    isSyncing,
    lastSynced,
    fetchTrackedJobs,
    addJob,
    updateJobStatus,
    updateJob,
    deleteJob,
    moveJob,
    reorderInColumn,
    syncWithServer,
    getJobsByStatus,
    getStats,
  };
}

export default useJobTracker;
