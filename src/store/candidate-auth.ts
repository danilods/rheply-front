import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  CandidateUser,
  ParsedCVData,
  RegistrationSteps,
  Step1Data,
  Step2Data,
  Step3Data,
  CVUploadState,
  UploadStatus,
} from "@/types/candidate";

interface CandidateAuthState {
  // User state
  candidateUser: CandidateUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Registration state
  registrationSteps: RegistrationSteps;
  parsedCVData: ParsedCVData | null;
  cvUploadState: CVUploadState;
}

interface CandidateAuthActions {
  // Auth actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  setUser: (user: CandidateUser) => void;
  setToken: (token: string, refreshToken?: string) => void;
  clearError: () => void;
  checkAuth: () => boolean;

  // Registration actions
  setStep1Data: (data: Step1Data) => void;
  setStep2Data: (data: Step2Data) => void;
  setStep3Data: (data: Step3Data) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  resetRegistration: () => void;

  // CV Upload actions
  uploadCV: (file: File) => Promise<void>;
  parseCV: (fileUrl: string) => Promise<ParsedCVData>;
  setParsedCVData: (data: ParsedCVData | null) => void;
  skipCVUpload: () => void;
  resetCVUpload: () => void;

  // Complete registration
  completeRegistration: () => Promise<void>;

  // Password recovery
  requestPasswordRecovery: (email: string) => Promise<void>;
}

type CandidateAuthStore = CandidateAuthState & CandidateAuthActions;

const initialCVUploadState: CVUploadState = {
  file: null,
  progress: 0,
  status: UploadStatus.IDLE,
  error: undefined,
  uploadedUrl: undefined,
};

const initialRegistrationSteps: RegistrationSteps = {
  currentStep: 1,
  totalSteps: 3,
  completedSteps: [],
  stepData: {},
};

const initialState: CandidateAuthState = {
  candidateUser: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  registrationSteps: initialRegistrationSteps,
  parsedCVData: null,
  cvUploadState: initialCVUploadState,
};

export const useCandidateAuthStore = create<CandidateAuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Auth actions
      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/candidate/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, rememberMe }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Falha no login");
          }

          const data = await response.json();

          set({
            candidateUser: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Ocorreu um erro durante o login",
          });
          throw error;
        }
      },

      logout: () => {
        set({
          ...initialState,
          registrationSteps: initialRegistrationSteps,
          cvUploadState: initialCVUploadState,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("candidate-auth-storage");
          sessionStorage.removeItem("candidate-auth-storage");
        }
      },

      setUser: (user: CandidateUser) => {
        set({ candidateUser: user, isAuthenticated: true });
      },

      setToken: (token: string, refreshToken?: string) => {
        set({ token, ...(refreshToken && { refreshToken }) });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: () => {
        const { token, candidateUser } = get();
        const isValid = !!(token && candidateUser);
        set({ isAuthenticated: isValid });
        return isValid;
      },

      // Registration actions
      setStep1Data: (data: Step1Data) => {
        set((state) => ({
          registrationSteps: {
            ...state.registrationSteps,
            stepData: {
              ...state.registrationSteps.stepData,
              step1: data,
            },
            completedSteps: state.registrationSteps.completedSteps.includes(1)
              ? state.registrationSteps.completedSteps
              : [...state.registrationSteps.completedSteps, 1],
          },
        }));
      },

      setStep2Data: (data: Step2Data) => {
        set((state) => ({
          registrationSteps: {
            ...state.registrationSteps,
            stepData: {
              ...state.registrationSteps.stepData,
              step2: data,
            },
            completedSteps: state.registrationSteps.completedSteps.includes(2)
              ? state.registrationSteps.completedSteps
              : [...state.registrationSteps.completedSteps, 2],
          },
        }));
      },

      setStep3Data: (data: Step3Data) => {
        set((state) => ({
          registrationSteps: {
            ...state.registrationSteps,
            stepData: {
              ...state.registrationSteps.stepData,
              step3: data,
            },
            completedSteps: state.registrationSteps.completedSteps.includes(3)
              ? state.registrationSteps.completedSteps
              : [...state.registrationSteps.completedSteps, 3],
          },
        }));
      },

      nextStep: () => {
        set((state) => ({
          registrationSteps: {
            ...state.registrationSteps,
            currentStep: Math.min(
              state.registrationSteps.currentStep + 1,
              state.registrationSteps.totalSteps
            ),
          },
        }));
      },

      previousStep: () => {
        set((state) => ({
          registrationSteps: {
            ...state.registrationSteps,
            currentStep: Math.max(state.registrationSteps.currentStep - 1, 1),
          },
        }));
      },

      goToStep: (step: number) => {
        set((state) => ({
          registrationSteps: {
            ...state.registrationSteps,
            currentStep: Math.max(1, Math.min(step, state.registrationSteps.totalSteps)),
          },
        }));
      },

      resetRegistration: () => {
        set({
          registrationSteps: initialRegistrationSteps,
          parsedCVData: null,
          cvUploadState: initialCVUploadState,
        });
      },

      // CV Upload actions
      uploadCV: async (file: File) => {
        set({
          cvUploadState: {
            file,
            progress: 0,
            status: UploadStatus.UPLOADING,
            error: undefined,
            uploadedUrl: undefined,
          },
        });

        try {
          const formData = new FormData();
          formData.append("cv", file);

          // Simulated upload with progress
          const xhr = new XMLHttpRequest();

          const uploadPromise = new Promise<string>((resolve, reject) => {
            xhr.upload.addEventListener("progress", (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                set((state) => ({
                  cvUploadState: {
                    ...state.cvUploadState,
                    progress,
                  },
                }));
              }
            });

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                resolve(response.url);
              } else {
                reject(new Error("Upload falhou"));
              }
            };

            xhr.onerror = () => reject(new Error("Erro de rede durante upload"));

            xhr.open("POST", "/api/candidate/cv/upload");
            xhr.send(formData);
          });

          const fileUrl = await uploadPromise;

          set((state) => ({
            cvUploadState: {
              ...state.cvUploadState,
              status: UploadStatus.PARSING,
              uploadedUrl: fileUrl,
            },
          }));

          // Parse the CV
          const parsedData = await get().parseCV(fileUrl);

          set((state) => ({
            cvUploadState: {
              ...state.cvUploadState,
              status: UploadStatus.SUCCESS,
            },
            parsedCVData: parsedData,
          }));
        } catch (error) {
          set((state) => ({
            cvUploadState: {
              ...state.cvUploadState,
              status: UploadStatus.ERROR,
              error: error instanceof Error ? error.message : "Erro ao fazer upload",
            },
          }));
          throw error;
        }
      },

      parseCV: async (fileUrl: string): Promise<ParsedCVData> => {
        try {
          const response = await fetch("/api/candidate/cv/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileUrl }),
          });

          if (!response.ok) {
            throw new Error("Falha ao analisar curriculo");
          }

          const data = await response.json();
          return data.parsedData;
        } catch (error) {
          throw error instanceof Error ? error : new Error("Erro ao analisar curriculo");
        }
      },

      setParsedCVData: (data: ParsedCVData | null) => {
        set({ parsedCVData: data });
      },

      skipCVUpload: () => {
        set((state) => ({
          registrationSteps: {
            ...state.registrationSteps,
            stepData: {
              ...state.registrationSteps.stepData,
              step2: { skipped: true },
            },
            completedSteps: state.registrationSteps.completedSteps.includes(2)
              ? state.registrationSteps.completedSteps
              : [...state.registrationSteps.completedSteps, 2],
          },
        }));
      },

      resetCVUpload: () => {
        set({
          cvUploadState: initialCVUploadState,
          parsedCVData: null,
        });
      },

      // Complete registration
      completeRegistration: async () => {
        set({ isLoading: true, error: null });
        const { registrationSteps, parsedCVData } = get();
        const { step1, step2, step3 } = registrationSteps.stepData;

        if (!step1 || !step3) {
          set({
            isLoading: false,
            error: "Dados de registro incompletos",
          });
          throw new Error("Dados de registro incompletos");
        }

        try {
          const registrationData = {
            ...step1,
            cvData: step2?.skipped ? null : parsedCVData,
            preferences: {
              areasOfInterest: step3.areasOfInterest,
              salaryExpectation: step3.salaryExpectation,
              availability: step3.availability,
              openToRelocation: step3.openToRelocation,
              receiveJobAlerts: step3.receiveJobAlerts,
            },
          };

          const response = await fetch("/api/candidate/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registrationData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Falha no registro");
          }

          const data = await response.json();

          set({
            candidateUser: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            registrationSteps: initialRegistrationSteps,
            cvUploadState: initialCVUploadState,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Ocorreu um erro durante o registro",
          });
          throw error;
        }
      },

      // Password recovery
      requestPasswordRecovery: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/candidate/auth/recover-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Falha ao enviar email de recuperacao");
          }

          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Erro ao solicitar recuperacao de senha",
          });
          throw error;
        }
      },
    }),
    {
      name: "candidate-auth-storage",
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
        candidateUser: state.candidateUser,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
