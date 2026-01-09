import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the candidate API
vi.mock('@/lib/api-candidate', () => ({
  candidateApi: {
    getApplications: vi.fn(),
    getApplicationById: vi.fn(),
    withdrawApplication: vi.fn(),
    applyToJob: vi.fn(),
  },
}));

// Import the mock
import { candidateApi } from '@/lib/api-candidate';

// Simple hook implementation for testing
const useApplications = () => {
  const [applications, setApplications] = React.useState<unknown[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchApplications = React.useCallback(async (pageNum: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await candidateApi.getApplications({ page: pageNum });
      setApplications(response.items);
      setTotalPages(response.totalPages);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar candidaturas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const withdrawApplication = React.useCallback(async (applicationId: string) => {
    try {
      await candidateApi.withdrawApplication(applicationId);
      setApplications((prev) =>
        prev.map((app: unknown) =>
          (app as { id: string }).id === applicationId
            ? { ...(app as object), status: 'withdrawn' }
            : app
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao retirar candidatura');
      return false;
    }
  }, []);

  const applyToJob = React.useCallback(async (jobId: string, coverLetter?: string) => {
    try {
      const newApplication = await candidateApi.applyToJob(jobId, coverLetter);
      setApplications((prev) => [newApplication, ...prev]);
      return newApplication;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao candidatar');
      throw err;
    }
  }, []);

  React.useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    isLoading,
    error,
    page,
    totalPages,
    fetchApplications,
    withdrawApplication,
    applyToJob,
  };
};

import React from 'react';

describe('useApplications', () => {
  const mockApplications = [
    {
      id: 'app-1',
      job_id: 'job-1',
      status: 'applied',
      applied_at: '2024-01-15T10:00:00Z',
      job: {
        title: 'Senior Developer',
        company: 'Tech Corp',
      },
    },
    {
      id: 'app-2',
      job_id: 'job-2',
      status: 'screening',
      applied_at: '2024-01-10T14:00:00Z',
      job: {
        title: 'Frontend Engineer',
        company: 'Startup Inc',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (candidateApi.getApplications as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: mockApplications,
      total: 2,
      page: 1,
      size: 10,
      totalPages: 1,
    });
  });

  it('fetches applications on mount', async () => {
    const { result } = renderHook(() => useApplications());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.applications).toHaveLength(2);
    expect(candidateApi.getApplications).toHaveBeenCalledTimes(1);
  });

  it('returns applications data', async () => {
    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.applications).toHaveLength(2);
    });

    expect(result.current.applications[0]).toEqual(mockApplications[0]);
    expect(result.current.applications[1]).toEqual(mockApplications[1]);
  });

  it('handles loading state', async () => {
    const { result } = renderHook(() => useApplications());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles errors', async () => {
    const errorMessage = 'Network error';
    (candidateApi.getApplications as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.applications).toHaveLength(0);
  });

  it('fetches specific page', async () => {
    (candidateApi.getApplications as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      items: mockApplications,
      total: 20,
      page: 1,
      size: 10,
      totalPages: 2,
    });

    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    (candidateApi.getApplications as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      items: [mockApplications[0]],
      total: 20,
      page: 2,
      size: 10,
      totalPages: 2,
    });

    await act(async () => {
      await result.current.fetchApplications(2);
    });

    expect(result.current.page).toBe(2);
    expect(candidateApi.getApplications).toHaveBeenCalledWith({ page: 2 });
  });

  it('withdraws application successfully', async () => {
    (candidateApi.withdrawApplication as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      success: true,
    });

    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.applications).toHaveLength(2);
    });

    let success: boolean;
    await act(async () => {
      success = await result.current.withdrawApplication('app-1');
    });

    expect(success!).toBe(true);
    expect(candidateApi.withdrawApplication).toHaveBeenCalledWith('app-1');
    expect(result.current.applications[0]).toMatchObject({
      id: 'app-1',
      status: 'withdrawn',
    });
  });

  it('handles withdraw application error', async () => {
    (candidateApi.withdrawApplication as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Cannot withdraw')
    );

    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.applications).toHaveLength(2);
    });

    let success: boolean;
    await act(async () => {
      success = await result.current.withdrawApplication('app-1');
    });

    expect(success!).toBe(false);
    expect(result.current.error).toBe('Cannot withdraw');
  });

  it('applies to job successfully', async () => {
    const newApplication = {
      id: 'app-3',
      job_id: 'job-3',
      status: 'applied',
      applied_at: '2024-01-20T10:00:00Z',
      job: {
        title: 'Backend Developer',
        company: 'New Corp',
      },
    };

    (candidateApi.applyToJob as ReturnType<typeof vi.fn>).mockResolvedValueOnce(newApplication);

    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.applications).toHaveLength(2);
    });

    await act(async () => {
      await result.current.applyToJob('job-3', 'Cover letter text');
    });

    expect(candidateApi.applyToJob).toHaveBeenCalledWith('job-3', 'Cover letter text');
    expect(result.current.applications).toHaveLength(3);
    expect(result.current.applications[0]).toEqual(newApplication);
  });

  it('handles apply to job error', async () => {
    (candidateApi.applyToJob as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Already applied')
    );

    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.applications).toHaveLength(2);
    });

    await expect(
      act(async () => {
        await result.current.applyToJob('job-1');
      })
    ).rejects.toThrow('Already applied');

    expect(result.current.error).toBe('Already applied');
  });

  it('provides pagination info', async () => {
    (candidateApi.getApplications as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      items: mockApplications,
      total: 25,
      page: 1,
      size: 10,
      totalPages: 3,
    });

    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(3);
  });
});
