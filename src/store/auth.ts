import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "recruiter" | "hiring_manager" | "admin";
  companyName: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
}

interface AuthActions {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: Omit<User, "id" | "createdAt"> & { password: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearError: () => void;
  checkAuth: () => boolean;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  _hasHydrated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.message || "Login failed");
          }

          const data = await response.json();

          // Backend returns access_token, map to token
          const token = data.access_token;

          // Set cookie for server-side middleware access
          if (typeof document !== "undefined") {
            const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24; // 7 days or 1 day
            document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          }

          // Decode JWT to get user info
          const payload = JSON.parse(atob(token.split('.')[1]));
          const user: User = {
            id: payload.sub,
            email: payload.email || email,
            fullName: payload.full_name || email.split('@')[0],
            role: payload.role || payload.user_type || 'recruiter',
            companyName: payload.company_name || 'RHeply',
            createdAt: new Date().toISOString(),
          };

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "An error occurred during login",
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // Simulated API call - replace with actual API endpoint
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Registration failed");
          }

          const data = await response.json();

          // Set cookie for server-side middleware access
          if (typeof document !== "undefined") {
            document.cookie = `auth-token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "An error occurred during registration",
          });
          throw error;
        }
      },

      logout: () => {
        set(initialState);
        // Clear any stored tokens
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
          sessionStorage.removeItem("auth-storage");
          // Clear auth cookie
          document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token: string) => {
        set({ token });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: () => {
        const { token, user, isAuthenticated } = get();
        const isValid = !!(token && user);
        // Only update state if it changed to avoid infinite re-renders
        if (isAuthenticated !== isValid) {
          set({ isAuthenticated: isValid });
        }
        return isValid;
      },
    }),
    {
      name: "auth-storage",
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
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);
