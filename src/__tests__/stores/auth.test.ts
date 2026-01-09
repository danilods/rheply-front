import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';

// We need to import after mocking fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Reset the store module before importing
vi.resetModules();

// Import the actual store
import { useCandidateAuthStore } from '@/store/candidate-auth';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useCandidateAuthStore.setState({
        candidateUser: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        registrationSteps: {
          currentStep: 1,
          totalSteps: 3,
          completedSteps: [],
          stepData: {},
        },
        parsedCVData: null,
        cvUploadState: {
          file: null,
          progress: 0,
          status: 'idle' as const,
          error: undefined,
          uploadedUrl: undefined,
        },
      });
    });
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('logs in user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        full_name: 'Test User',
        profile_completion: 75,
      };

      const mockResponse = {
        user: mockUser,
        token: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { login } = useCandidateAuthStore.getState();

      await act(async () => {
        await login('test@test.com', 'password123');
      });

      const state = useCandidateAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.candidateUser).toEqual(mockUser);
      expect(state.token).toBe('test-access-token');
      expect(state.refreshToken).toBe('test-refresh-token');
      expect(state.error).toBeNull();
    });

    it('handles login failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      });

      const { login } = useCandidateAuthStore.getState();

      await expect(
        act(async () => {
          await login('test@test.com', 'wrongpass');
        })
      ).rejects.toThrow('Invalid credentials');

      const state = useCandidateAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });

    it('sets loading state during login', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    user: { id: '1', email: 'test@test.com' },
                    token: 'token',
                    refreshToken: 'refresh',
                  }),
                }),
              100
            )
          )
      );

      const { login } = useCandidateAuthStore.getState();

      const loginPromise = act(async () => {
        await login('test@test.com', 'password');
      });

      // Check loading state immediately
      expect(useCandidateAuthStore.getState().isLoading).toBe(true);

      await loginPromise;

      expect(useCandidateAuthStore.getState().isLoading).toBe(false);
    });

    it('logs out user', () => {
      // First, set up logged in state
      act(() => {
        useCandidateAuthStore.setState({
          candidateUser: { id: '1', email: 'test@test.com' } as any,
          token: 'test-token',
          refreshToken: 'test-refresh',
          isAuthenticated: true,
        });
      });

      const { logout } = useCandidateAuthStore.getState();

      act(() => {
        logout();
      });

      const state = useCandidateAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.candidateUser).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
    });

    it('clears error', () => {
      act(() => {
        useCandidateAuthStore.setState({ error: 'Some error' });
      });

      const { clearError } = useCandidateAuthStore.getState();

      act(() => {
        clearError();
      });

      expect(useCandidateAuthStore.getState().error).toBeNull();
    });

    it('checks auth status', () => {
      // Not authenticated
      let result = useCandidateAuthStore.getState().checkAuth();
      expect(result).toBe(false);

      // Set authenticated state
      act(() => {
        useCandidateAuthStore.setState({
          token: 'valid-token',
          candidateUser: { id: '1', email: 'test@test.com' } as any,
        });
      });

      result = useCandidateAuthStore.getState().checkAuth();
      expect(result).toBe(true);
      expect(useCandidateAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe('Registration', () => {
    it('sets step 1 data', () => {
      const step1Data = {
        email: 'new@test.com',
        password: 'SecurePass123!',
        full_name: 'New User',
        phone: '11999999999',
        cpf: '12345678901',
      };

      const { setStep1Data } = useCandidateAuthStore.getState();

      act(() => {
        setStep1Data(step1Data);
      });

      const state = useCandidateAuthStore.getState();
      expect(state.registrationSteps.stepData.step1).toEqual(step1Data);
      expect(state.registrationSteps.completedSteps).toContain(1);
    });

    it('sets step 2 data', () => {
      const step2Data = {
        cvUrl: 'https://storage.example.com/cv.pdf',
        parsedData: { skills: ['Python', 'JavaScript'] },
      };

      const { setStep2Data } = useCandidateAuthStore.getState();

      act(() => {
        setStep2Data(step2Data);
      });

      const state = useCandidateAuthStore.getState();
      expect(state.registrationSteps.stepData.step2).toEqual(step2Data);
      expect(state.registrationSteps.completedSteps).toContain(2);
    });

    it('sets step 3 data', () => {
      const step3Data = {
        areasOfInterest: ['Backend', 'DevOps'],
        salaryExpectation: { min: 8000, max: 12000 },
        availability: 'immediate',
        openToRelocation: true,
        receiveJobAlerts: true,
      };

      const { setStep3Data } = useCandidateAuthStore.getState();

      act(() => {
        setStep3Data(step3Data);
      });

      const state = useCandidateAuthStore.getState();
      expect(state.registrationSteps.stepData.step3).toEqual(step3Data);
      expect(state.registrationSteps.completedSteps).toContain(3);
    });

    it('navigates to next step', () => {
      const { nextStep } = useCandidateAuthStore.getState();

      expect(useCandidateAuthStore.getState().registrationSteps.currentStep).toBe(1);

      act(() => {
        nextStep();
      });

      expect(useCandidateAuthStore.getState().registrationSteps.currentStep).toBe(2);

      act(() => {
        nextStep();
      });

      expect(useCandidateAuthStore.getState().registrationSteps.currentStep).toBe(3);

      // Should not exceed total steps
      act(() => {
        nextStep();
      });

      expect(useCandidateAuthStore.getState().registrationSteps.currentStep).toBe(3);
    });

    it('navigates to previous step', () => {
      act(() => {
        useCandidateAuthStore.setState({
          registrationSteps: {
            ...useCandidateAuthStore.getState().registrationSteps,
            currentStep: 3,
          },
        });
      });

      const { previousStep } = useCandidateAuthStore.getState();

      act(() => {
        previousStep();
      });

      expect(useCandidateAuthStore.getState().registrationSteps.currentStep).toBe(2);

      act(() => {
        previousStep();
      });

      expect(useCandidateAuthStore.getState().registrationSteps.currentStep).toBe(1);

      // Should not go below 1
      act(() => {
        previousStep();
      });

      expect(useCandidateAuthStore.getState().registrationSteps.currentStep).toBe(1);
    });

    it('goes to specific step', () => {
      const { goToStep } = useCandidateAuthStore.getState();

      act(() => {
        goToStep(2);
      });

      expect(useCandidateAuthStore.getState().registrationSteps.currentStep).toBe(2);

      act(() => {
        goToStep(3);
      });

      expect(useCandidateAuthStore.getState().registrationSteps.currentStep).toBe(3);
    });

    it('resets registration', () => {
      // Set up some registration data
      act(() => {
        useCandidateAuthStore.setState({
          registrationSteps: {
            currentStep: 2,
            totalSteps: 3,
            completedSteps: [1],
            stepData: { step1: { email: 'test@test.com' } },
          },
          parsedCVData: { skills: ['Python'] } as any,
        });
      });

      const { resetRegistration } = useCandidateAuthStore.getState();

      act(() => {
        resetRegistration();
      });

      const state = useCandidateAuthStore.getState();
      expect(state.registrationSteps.currentStep).toBe(1);
      expect(state.registrationSteps.completedSteps).toHaveLength(0);
      expect(state.registrationSteps.stepData).toEqual({});
      expect(state.parsedCVData).toBeNull();
    });

    it('skips CV upload', () => {
      const { skipCVUpload } = useCandidateAuthStore.getState();

      act(() => {
        skipCVUpload();
      });

      const state = useCandidateAuthStore.getState();
      expect(state.registrationSteps.stepData.step2).toEqual({ skipped: true });
      expect(state.registrationSteps.completedSteps).toContain(2);
    });
  });

  describe('Password Recovery', () => {
    it('requests password recovery successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Email sent' }),
      });

      const { requestPasswordRecovery } = useCandidateAuthStore.getState();

      await act(async () => {
        await requestPasswordRecovery('test@test.com');
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/candidate/auth/recover-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@test.com' }),
        })
      );

      expect(useCandidateAuthStore.getState().isLoading).toBe(false);
    });

    it('handles password recovery error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Email not found' }),
      });

      const { requestPasswordRecovery } = useCandidateAuthStore.getState();

      await expect(
        act(async () => {
          await requestPasswordRecovery('unknown@test.com');
        })
      ).rejects.toThrow('Email not found');

      expect(useCandidateAuthStore.getState().error).toBe('Email not found');
    });
  });

  describe('Token Management', () => {
    it('sets user', () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        full_name: 'Test User',
      } as any;

      const { setUser } = useCandidateAuthStore.getState();

      act(() => {
        setUser(user);
      });

      const state = useCandidateAuthStore.getState();
      expect(state.candidateUser).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    it('sets token with refresh token', () => {
      const { setToken } = useCandidateAuthStore.getState();

      act(() => {
        setToken('new-token', 'new-refresh-token');
      });

      const state = useCandidateAuthStore.getState();
      expect(state.token).toBe('new-token');
      expect(state.refreshToken).toBe('new-refresh-token');
    });

    it('sets token without refresh token', () => {
      const { setToken } = useCandidateAuthStore.getState();

      act(() => {
        setToken('new-token');
      });

      const state = useCandidateAuthStore.getState();
      expect(state.token).toBe('new-token');
    });
  });
});
