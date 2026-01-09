/**
 * Typing Test Store - Estado global para testes de digitação.
 *
 * Gerencia o estado da sessão de teste, métricas em tempo real,
 * e resultados usando Zustand.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  TypingTest,
  TypingTestResult,
  TestSession,
  RealTimeMetrics,
  TypingTestStats,
} from "@/types/typing-test";

// ============================================================================
// Interfaces
// ============================================================================

interface TypingTestState {
  // Lista de testes
  tests: TypingTest[];
  currentTest: TypingTest | null;

  // Sessão ativa
  session: TestSession | null;

  // Métricas em tempo real
  metrics: RealTimeMetrics;

  // Resultado
  result: TypingTestResult | null;

  // Estatísticas
  stats: TypingTestStats | null;

  // UI State
  isLoading: boolean;
  error: string | null;
}

interface TypingTestActions {
  // Gerenciamento de testes
  setTests: (tests: TypingTest[]) => void;
  addTest: (test: TypingTest) => void;
  setCurrentTest: (test: TypingTest | null) => void;

  // Sessão de teste
  startSession: (test: TypingTest) => void;
  updateTypedText: (text: string) => void;
  recordPasteAttempt: () => void;
  recordFocusLost: () => void;
  endSession: () => void;
  resetSession: () => void;

  // Métricas
  updateMetrics: () => void;
  calculateWPM: (text: string, seconds: number) => number;
  calculateAccuracy: (original: string, typed: string) => number;

  // Resultado
  setResult: (result: TypingTestResult) => void;
  clearResult: () => void;

  // Estatísticas
  setStats: (stats: TypingTestStats) => void;

  // UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type TypingTestStore = TypingTestState & TypingTestActions;

// ============================================================================
// Estado inicial
// ============================================================================

const initialState: TypingTestState = {
  tests: [],
  currentTest: null,
  session: null,
  metrics: {
    wpm: 0,
    accuracy: 100,
    errors: 0,
    elapsedSeconds: 0,
    progress: 0,
  },
  result: null,
  stats: null,
  isLoading: false,
  error: null,
};

// ============================================================================
// Store
// ============================================================================

export const useTypingTestStore = create<TypingTestStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ======================================================================
      // Gerenciamento de testes
      // ======================================================================

      setTests: (tests) => set({ tests }),

      addTest: (test) =>
        set((state) => ({
          tests: [test, ...state.tests],
        })),

      setCurrentTest: (test) => set({ currentTest: test }),

      // ======================================================================
      // Sessão de teste
      // ======================================================================

      startSession: (test) => {
        const session: TestSession = {
          testId: test.id,
          textSample: test.textSample,
          difficulty: test.difficulty,
          startedAt: new Date(),
          typedText: "",
          currentIndex: 0,
          errors: 0,
          pasteAttempts: 0,
          focusLostCount: 0,
          isRunning: true,
        };

        set({
          currentTest: test,
          session,
          metrics: {
            wpm: 0,
            accuracy: 100,
            errors: 0,
            elapsedSeconds: 0,
            progress: 0,
          },
          result: null,
          error: null,
        });
      },

      updateTypedText: (text) => {
        const { session } = get();
        if (!session) return;

        // Calcula erros
        let errors = 0;
        const original = session.textSample;
        const minLen = Math.min(original.length, text.length);

        for (let i = 0; i < minLen; i++) {
          if (original[i] !== text[i]) {
            errors++;
          }
        }

        // Adiciona diferença de tamanho como erro
        errors += Math.abs(original.length - text.length);

        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                typedText: text,
                currentIndex: text.length,
                errors,
              }
            : null,
        }));

        // Atualiza métricas
        get().updateMetrics();
      },

      recordPasteAttempt: () => {
        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                pasteAttempts: state.session.pasteAttempts + 1,
              }
            : null,
        }));
      },

      recordFocusLost: () => {
        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                focusLostCount: state.session.focusLostCount + 1,
              }
            : null,
        }));
      },

      endSession: () => {
        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                isRunning: false,
              }
            : null,
        }));
      },

      resetSession: () => {
        set({
          session: null,
          metrics: initialState.metrics,
          result: null,
        });
      },

      // ======================================================================
      // Métricas
      // ======================================================================

      updateMetrics: () => {
        const { session, calculateWPM, calculateAccuracy } = get();
        if (!session || !session.isRunning) return;

        const elapsedSeconds = Math.floor(
          (Date.now() - session.startedAt.getTime()) / 1000
        );

        const wpm = calculateWPM(session.typedText, elapsedSeconds);
        const accuracy = calculateAccuracy(
          session.textSample,
          session.typedText
        );
        const progress = Math.min(
          100,
          (session.typedText.length / session.textSample.length) * 100
        );

        set({
          metrics: {
            wpm,
            accuracy,
            errors: session.errors,
            elapsedSeconds,
            progress,
          },
        });
      },

      calculateWPM: (text, seconds) => {
        if (seconds <= 0) return 0;

        // WPM = (caracteres / 5) / minutos
        const chars = text.length;
        const minutes = seconds / 60;
        const wpm = chars / 5 / minutes;

        return Math.round(wpm * 10) / 10;
      },

      calculateAccuracy: (original, typed) => {
        if (!original || !typed) return 100;

        let errors = 0;
        const minLen = Math.min(original.length, typed.length);

        for (let i = 0; i < minLen; i++) {
          if (original[i] !== typed[i]) {
            errors++;
          }
        }

        errors += Math.abs(original.length - typed.length);

        const accuracy = Math.max(0, (1 - errors / original.length) * 100);
        return Math.round(accuracy * 10) / 10;
      },

      // ======================================================================
      // Resultado
      // ======================================================================

      setResult: (result) => set({ result }),

      clearResult: () => set({ result: null }),

      // ======================================================================
      // Estatísticas
      // ======================================================================

      setStats: (stats) => set({ stats }),

      // ======================================================================
      // UI
      // ======================================================================

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: "typing-test-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persiste apenas dados não sensíveis
        tests: state.tests.slice(0, 10), // Últimos 10 testes
        stats: state.stats,
      }),
    }
  )
);

// ============================================================================
// Hooks auxiliares
// ============================================================================

/**
 * Hook para obter apenas o estado da sessão atual.
 */
export const useCurrentSession = () =>
  useTypingTestStore((state) => ({
    session: state.session,
    metrics: state.metrics,
    isRunning: state.session?.isRunning ?? false,
  }));

/**
 * Hook para obter apenas o resultado do teste.
 */
export const useTestResult = () =>
  useTypingTestStore((state) => ({
    result: state.result,
    hasResult: state.result !== null,
  }));

/**
 * Hook para ações da sessão.
 */
export const useSessionActions = () =>
  useTypingTestStore((state) => ({
    startSession: state.startSession,
    updateTypedText: state.updateTypedText,
    recordPasteAttempt: state.recordPasteAttempt,
    recordFocusLost: state.recordFocusLost,
    endSession: state.endSession,
    resetSession: state.resetSession,
  }));
