/**
 * Typing Test API - Cliente de API para testes de digitação.
 *
 * Este módulo implementa as chamadas à API para criar, executar,
 * submeter e consultar testes de digitação.
 */

import axios from "axios";
import {
  TypingTest,
  TypingTestDetail,
  TypingTestStartResponse,
  TypingTestResult,
  TypingTestListResponse,
  TypingTestStats,
  CreateTypingTestInput,
  SubmitTypingTestInput,
  TestDifficulty,
  TestStatus,
  EvaluationResult,
} from "@/types/typing-test";

// ============================================================================
// Configuração
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("candidate_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem("candidate_token");
      window.location.href = "/candidato/login";
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// Funções de conversão (snake_case -> camelCase)
// ============================================================================

function toTypingTest(data: Record<string, unknown>): TypingTest {
  return {
    id: data.id as string,
    difficulty: data.difficulty as TestDifficulty,
    textSample: data.text_sample as string,
    status: data.status as TestStatus,
    wpm: data.wpm as number | undefined,
    accuracy: data.accuracy as number | undefined,
    errors: data.errors as number | undefined,
    durationSeconds: data.duration_seconds as number | undefined,
    evaluationResult: data.evaluation_result as EvaluationResult | undefined,
    createdAt: data.created_at as string,
    startedAt: data.started_at as string | undefined,
    completedAt: data.completed_at as string | undefined,
    isSuspicious: (data.is_suspicious as boolean) || false,
    pasteAttempts: (data.paste_attempts as number) || 0,
    focusLostCount: (data.focus_lost_count as number) || 0,
  };
}

function toTypingTestDetail(data: Record<string, unknown>): TypingTestDetail {
  return {
    ...toTypingTest(data),
    candidateId: data.candidate_id as string | undefined,
    candidateName: data.candidate_name as string | undefined,
    candidateCpf: data.candidate_cpf as string | undefined,
    candidateEmail: data.candidate_email as string | undefined,
    candidatePhone: data.candidate_phone as string | undefined,
    selectionProcessId: data.selection_process_id as string | undefined,
    typedText: data.typed_text as string | undefined,
    metadata: data.metadata as Record<string, unknown> | undefined,
    updatedAt: data.updated_at as string,
  };
}

function toTypingTestStartResponse(
  data: Record<string, unknown>
): TypingTestStartResponse {
  return {
    id: data.id as string,
    textSample: data.text_sample as string,
    difficulty: data.difficulty as TestDifficulty,
    status: data.status as TestStatus,
    startedAt: data.started_at as string,
  };
}

function toTypingTestResult(data: Record<string, unknown>): TypingTestResult {
  return {
    id: data.id as string,
    wpm: data.wpm as number,
    accuracy: data.accuracy as number,
    errors: data.errors as number,
    durationSeconds: data.duration_seconds as number,
    evaluationResult: data.evaluation_result as EvaluationResult,
    status: data.status as TestStatus,
    completedAt: data.completed_at as string,
    feedbackMessage: data.feedback_message as string,
    wpmPercentile: data.wpm_percentile as number | undefined,
    isAboveAverage: (data.is_above_average as boolean) || false,
  };
}

function toTypingTestListResponse(
  data: Record<string, unknown>
): TypingTestListResponse {
  return {
    items: ((data.items as Record<string, unknown>[]) || []).map(toTypingTest),
    total: data.total as number,
    page: data.page as number,
    pageSize: data.page_size as number,
    pages: data.pages as number,
    hasNext: data.has_next as boolean,
    hasPrev: data.has_prev as boolean,
  };
}

function toTypingTestStats(data: Record<string, unknown>): TypingTestStats {
  return {
    totalTests: data.total_tests as number,
    completedTests: data.completed_tests as number,
    averageWpm: data.average_wpm as number,
    averageAccuracy: data.average_accuracy as number,
    approvalRate: data.approval_rate as number,
    byDifficulty: data.by_difficulty as Record<
      string,
      { count: number; avgWpm: number; avgAccuracy: number }
    >,
    testsToday: data.tests_today as number,
    testsThisWeek: data.tests_this_week as number,
    testsThisMonth: data.tests_this_month as number,
  };
}

// ============================================================================
// API Client
// ============================================================================

export const typingTestApi = {
  // ==========================================================================
  // Endpoints Públicos (sem autenticação)
  // ==========================================================================

  /**
   * Cria um teste público (sem login).
   */
  createPublicTest: async (
    data: CreateTypingTestInput
  ): Promise<TypingTest> => {
    const response = await apiClient.post("/typing-tests/public", {
      difficulty: data.difficulty || TestDifficulty.MEDIUM,
      candidate_name: data.candidateName,
      candidate_cpf: data.candidateCpf,
      candidate_email: data.candidateEmail,
      candidate_phone: data.candidatePhone,
      selection_process_id: data.selectionProcessId,
    });
    return toTypingTest(response.data);
  },

  /**
   * Inicia um teste público.
   */
  startPublicTest: async (testId: string): Promise<TypingTestStartResponse> => {
    const response = await apiClient.post(
      `/typing-tests/public/${testId}/start`
    );
    return toTypingTestStartResponse(response.data);
  },

  /**
   * Submete resultado de teste público.
   */
  submitPublicTest: async (
    testId: string,
    data: SubmitTypingTestInput
  ): Promise<TypingTestResult> => {
    const response = await apiClient.post(
      `/typing-tests/public/${testId}/submit`,
      {
        typed_text: data.typedText,
        duration_seconds: data.durationSeconds,
        paste_attempts: data.pasteAttempts || 0,
        focus_lost_count: data.focusLostCount || 0,
        keystroke_data: data.keystrokeData,
      }
    );
    return toTypingTestResult(response.data);
  },

  /**
   * Consulta teste público.
   */
  getPublicTest: async (testId: string): Promise<TypingTestDetail> => {
    const response = await apiClient.get(`/typing-tests/public/${testId}`);
    return toTypingTestDetail(response.data);
  },

  // ==========================================================================
  // Endpoints Autenticados (candidato logado)
  // ==========================================================================

  /**
   * Cria um teste para candidato autenticado.
   */
  createTest: async (data: CreateTypingTestInput): Promise<TypingTest> => {
    const response = await apiClient.post("/typing-tests", {
      difficulty: data.difficulty || TestDifficulty.MEDIUM,
      selection_process_id: data.selectionProcessId,
    });
    return toTypingTest(response.data);
  },

  /**
   * Lista testes do candidato autenticado.
   */
  listMyTests: async (params?: {
    page?: number;
    pageSize?: number;
    status?: TestStatus;
  }): Promise<TypingTestListResponse> => {
    const response = await apiClient.get("/typing-tests/my-tests", {
      params: {
        page: params?.page || 1,
        page_size: params?.pageSize || 20,
        status: params?.status,
      },
    });
    return toTypingTestListResponse(response.data);
  },

  /**
   * Inicia um teste.
   */
  startTest: async (testId: string): Promise<TypingTestStartResponse> => {
    const response = await apiClient.post(`/typing-tests/${testId}/start`);
    return toTypingTestStartResponse(response.data);
  },

  /**
   * Submete resultado de teste.
   */
  submitTest: async (
    testId: string,
    data: SubmitTypingTestInput
  ): Promise<TypingTestResult> => {
    const response = await apiClient.post(`/typing-tests/${testId}/submit`, {
      typed_text: data.typedText,
      duration_seconds: data.durationSeconds,
      paste_attempts: data.pasteAttempts || 0,
      focus_lost_count: data.focusLostCount || 0,
      keystroke_data: data.keystrokeData,
    });
    return toTypingTestResult(response.data);
  },

  /**
   * Consulta detalhes de um teste.
   */
  getTest: async (testId: string): Promise<TypingTestDetail> => {
    const response = await apiClient.get(`/typing-tests/${testId}`);
    return toTypingTestDetail(response.data);
  },

  /**
   * Cancela um teste.
   */
  cancelTest: async (testId: string): Promise<void> => {
    await apiClient.delete(`/typing-tests/${testId}`);
  },

  // ==========================================================================
  // Endpoints Administrativos (RH)
  // ==========================================================================

  /**
   * Lista todos os testes (admin).
   */
  listAllTests: async (params?: {
    page?: number;
    pageSize?: number;
    status?: TestStatus;
    difficulty?: TestDifficulty;
    selectionProcessId?: string;
  }): Promise<TypingTestListResponse> => {
    const response = await apiClient.get("/typing-tests", {
      params: {
        page: params?.page || 1,
        page_size: params?.pageSize || 20,
        status: params?.status,
        difficulty: params?.difficulty,
        selection_process_id: params?.selectionProcessId,
      },
    });
    return toTypingTestListResponse(response.data);
  },

  /**
   * Obtém estatísticas dos testes.
   */
  getStats: async (selectionProcessId?: string): Promise<TypingTestStats> => {
    const response = await apiClient.get("/typing-tests/stats", {
      params: { selection_process_id: selectionProcessId },
    });
    return toTypingTestStats(response.data);
  },
};

export default typingTestApi;
