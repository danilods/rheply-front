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
  refreshToken: string | null;
  /** A escolha da caixa "lembrar de mim", que a renovação precisa respeitar. */
  lembrarSessao: boolean;
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
  /** Troca o refresh token por um access token novo. Devolve null se a sessão acabou. */
  renovarSessao: () => Promise<string | null>;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  lembrarSessao: false,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  _hasHydrated: false,
};

/**
 * Instante de expiração de um JWT, em milissegundos, ou null se o token não
 * disser. Ler o `exp` é o que separa "tenho um token" de "tenho uma sessão":
 * antes disso o app se achava logado com um token vencido e só descobria no
 * primeiro 401, que derrubava tudo para a tela de login.
 */
export function expiraEm(token: string | null): number | null {
  if (!token) return null;
  try {
    const carga = JSON.parse(atob(token.split(".")[1]));
    return typeof carga.exp === "number" ? carga.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Margem antes do vencimento em que já vale renovar, para não perder a corrida. */
export const MARGEM_RENOVACAO_MS = 60_000;

export function tokenExpirado(token: string | null, margem = 0): boolean {
  const quando = expiraEm(token);
  if (quando === null) return false;
  return Date.now() + margem >= quando;
}

/**
 * O cookie existe para o middleware, que roda no servidor e não enxerga o
 * localStorage. Ele dura o que a sessão dura de verdade — a vida do refresh
 * token —, e não uma janela fixa escolhida à parte. Quando as duas durações
 * divergem, ou o middleware barra quem ainda tem sessão, ou deixa passar quem
 * já não tem e a página só descobre no primeiro 401.
 */
function gravarCookie(token: string, refresh: string | null, lembrar: boolean) {
  if (typeof document === "undefined") return;

  // Sem "lembrar de mim" o cookie não leva prazo: morre quando o navegador
  // fecha, que é o que a caixa promete. Com ele, dura o que o refresh dura.
  if (!lembrar) {
    document.cookie = `auth-token=${token}; path=/; SameSite=Lax`;
    return;
  }
  const fim = expiraEm(refresh);
  const segundos = fim
    ? Math.max(0, Math.floor((fim - Date.now()) / 1000))
    : 60 * 60 * 24;
  document.cookie = `auth-token=${token}; path=/; max-age=${segundos}; SameSite=Lax`;
}

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
          gravarCookie(token, data.refresh_token ?? null, rememberMe);
          set({ lembrarSessao: rememberMe });

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
            // Sem guardar isto, a sessão morria em trinta minutos e não havia
            // como renovar: o backend devolve o refresh desde sempre e o
            // frontend o descartava na linha seguinte.
            refreshToken: data.refresh_token ?? null,
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
        // Reset state but keep _hasHydrated true to avoid blocking UI
        set({ ...initialState, _hasHydrated: true });
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
        const isValid = !!(token && user) && !tokenExpirado(token);
        // Only update state if it changed to avoid infinite re-renders
        if (isAuthenticated !== isValid) {
          set({ isAuthenticated: isValid });
        }
        return isValid;
      },

      renovarSessao: async () => {
        const { refreshToken } = get();
        if (!refreshToken || tokenExpirado(refreshToken)) return null;

        try {
          const resposta = await fetch("/api/v1/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (!resposta.ok) return null;

          const dados = await resposta.json();
          const novo: string | undefined = dados.access_token;
          if (!novo) return null;

          gravarCookie(novo, dados.refresh_token ?? refreshToken, get().lembrarSessao);
          set({
            token: novo,
            refreshToken: dados.refresh_token ?? refreshToken,
            isAuthenticated: true,
          });
          return novo;
        } catch {
          // Rede fora não é sessão vencida: quem chamou decide o que fazer.
          return null;
        }
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
        refreshToken: state.refreshToken,
        lembrarSessao: state.lembrarSessao,
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
