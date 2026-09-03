// API client configuration
// TODO: Implement actual API client when backend is ready

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { MARGEM_RENOVACAO_MS, tokenExpirado, useAuthStore } from '@/store/auth';

/**
 * Renovação em fila única.
 *
 * Uma tela do painel dispara várias chamadas juntas. Se todas renovarem ao
 * mesmo tempo, o servidor recebe uma rajada e as respostas se atropelam, com
 * a última gravando um token que já não é o corrente. Aqui a primeira que
 * precisa renovar cria a promessa e as demais esperam nela.
 */
let renovacaoEmCurso: Promise<string | null> | null = null;

function renovar(): Promise<string | null> {
  if (!renovacaoEmCurso) {
    renovacaoEmCurso = useAuthStore
      .getState()
      .renovarSessao()
      .finally(() => {
        renovacaoEmCurso = null;
      });
  }
  return renovacaoEmCurso;
}

/** Sessão acabou de verdade: limpa e manda para o login guardando o destino. */
function encerrarSessao() {
  if (typeof window === 'undefined') return;
  useAuthStore.getState().logout();
  const destino = window.location.pathname + window.location.search;
  const login = new URL('/login', window.location.origin);
  if (destino && destino !== '/' && !destino.startsWith('/login')) {
    login.searchParams.set('redirect', destino);
  }
  window.location.href = login.toString();
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  /** Base pública, para quem precisa montar uma URL sem passar pelo axios. */
  readonly baseURL = API_BASE_URL;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (typeof window === 'undefined') return config;

        let token = useAuthStore.getState().token;

        // Vencido, ou a um minuto de vencer: renova antes de gastar a chamada.
        // Sem isto o primeiro pedido depois de trinta minutos sempre falhava.
        if (token && tokenExpirado(token, MARGEM_RENOVACAO_MS)) {
          token = (await renovar()) ?? token;
        }

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const pedido = error.config as (InternalAxiosRequestConfig & { _jaRenovou?: boolean }) | undefined;

        // Um 401 é motivo para tentar renovar, não para derrubar a sessão.
        // Só depois que a renovação falha é que a sessão acabou de fato.
        if (error.response?.status === 401 && pedido && !pedido._jaRenovou && typeof window !== 'undefined') {
          pedido._jaRenovou = true;
          const novo = await renovar();
          if (novo) {
            pedido.headers.Authorization = `Bearer ${novo}`;
            return this.client.request(pedido);
          }
          encerrarSessao();
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  // Method for file uploads
  async upload<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  // Method for uploading FormData directly
  async uploadFormData<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  // Method for downloading blob data
  async downloadBlob(url: string): Promise<AxiosResponse<Blob>> {
    return this.client.get<Blob>(url, {
      responseType: 'blob',
    });
  }
}

export const apiClient = new ApiClient();
