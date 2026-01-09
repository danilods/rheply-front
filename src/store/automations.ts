/**
 * Zustand store for automation state management
 */
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  Automation,
  AutomationTemplate,
  AutomationRun,
  AutomationCreateInput,
  AutomationUpdateInput,
} from "@/types/automation";

interface AutomationsState {
  // Data
  automations: Automation[];
  currentAutomation: Automation | null;
  templates: AutomationTemplate[];
  runs: AutomationRun[];

  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isTesting: boolean;
  error: string | null;

  // Pagination
  totalAutomations: number;
  currentPage: number;
  pageSize: number;

  // Filters
  filters: {
    isActive: boolean | null;
    triggerType: string | null;
    search: string;
  };

  // Actions
  setAutomations: (automations: Automation[], total: number) => void;
  setCurrentAutomation: (automation: Automation | null) => void;
  setTemplates: (templates: AutomationTemplate[]) => void;
  setRuns: (runs: AutomationRun[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<AutomationsState["filters"]>) => void;

  // API Actions
  fetchAutomations: () => Promise<void>;
  fetchAutomation: (id: string) => Promise<void>;
  createAutomation: (data: AutomationCreateInput) => Promise<Automation | null>;
  updateAutomation: (id: string, data: AutomationUpdateInput) => Promise<Automation | null>;
  deleteAutomation: (id: string) => Promise<boolean>;
  toggleAutomation: (id: string) => Promise<Automation | null>;
  testAutomation: (id: string, sampleData: Record<string, any>) => Promise<any>;
  fetchTemplates: () => Promise<void>;
  cloneTemplate: (templateId: string) => Promise<Automation | null>;
  fetchRuns: (automationId: string) => Promise<void>;

  // Reset
  reset: () => void;
}

const initialState = {
  automations: [],
  currentAutomation: null,
  templates: [],
  runs: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isTesting: false,
  error: null,
  totalAutomations: 0,
  currentPage: 1,
  pageSize: 20,
  filters: {
    isActive: null,
    triggerType: null,
    search: "",
  },
};

export const useAutomationsStore = create<AutomationsState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setAutomations: (automations, total) =>
          set({ automations, totalAutomations: total }),

        setCurrentAutomation: (automation) =>
          set({ currentAutomation: automation }),

        setTemplates: (templates) => set({ templates }),

        setRuns: (runs) => set({ runs }),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        setPage: (page) => set({ currentPage: page }),

        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            currentPage: 1,
          })),

        fetchAutomations: async () => {
          const { currentPage, pageSize, filters } = get();
          set({ isLoading: true, error: null });

          try {
            const params = new URLSearchParams({
              page: currentPage.toString(),
              page_size: pageSize.toString(),
            });

            if (filters.isActive !== null) {
              params.append("is_active", filters.isActive.toString());
            }
            if (filters.triggerType) {
              params.append("trigger_type", filters.triggerType);
            }
            if (filters.search) {
              params.append("search", filters.search);
            }

            const response = await fetch(`/api/v1/automations?${params}`);
            if (!response.ok) throw new Error("Failed to fetch automations");

            const data = await response.json();
            set({
              automations: data.items,
              totalAutomations: data.total,
              isLoading: false,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Unknown error",
              isLoading: false,
            });
          }
        },

        fetchAutomation: async (id) => {
          set({ isLoading: true, error: null });

          try {
            const response = await fetch(`/api/v1/automations/${id}`);
            if (!response.ok) throw new Error("Failed to fetch automation");

            const data = await response.json();
            set({ currentAutomation: data, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Unknown error",
              isLoading: false,
            });
          }
        },

        createAutomation: async (data) => {
          set({ isCreating: true, error: null });

          try {
            const response = await fetch("/api/v1/automations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail?.errors?.join(", ") || "Failed to create automation");
            }

            const automation = await response.json();
            set((state) => ({
              automations: [automation, ...state.automations],
              isCreating: false,
            }));

            return automation;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Unknown error",
              isCreating: false,
            });
            return null;
          }
        },

        updateAutomation: async (id, data) => {
          set({ isUpdating: true, error: null });

          try {
            const response = await fetch(`/api/v1/automations/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail?.errors?.join(", ") || "Failed to update automation");
            }

            const automation = await response.json();
            set((state) => ({
              automations: state.automations.map((a) =>
                a.id === id ? automation : a
              ),
              currentAutomation: automation,
              isUpdating: false,
            }));

            return automation;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Unknown error",
              isUpdating: false,
            });
            return null;
          }
        },

        deleteAutomation: async (id) => {
          set({ isLoading: true, error: null });

          try {
            const response = await fetch(`/api/v1/automations/${id}`, {
              method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete automation");

            set((state) => ({
              automations: state.automations.filter((a) => a.id !== id),
              isLoading: false,
            }));

            return true;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Unknown error",
              isLoading: false,
            });
            return false;
          }
        },

        toggleAutomation: async (id) => {
          set({ isUpdating: true, error: null });

          try {
            const response = await fetch(`/api/v1/automations/${id}/toggle`, {
              method: "POST",
            });

            if (!response.ok) throw new Error("Failed to toggle automation");

            const automation = await response.json();
            set((state) => ({
              automations: state.automations.map((a) =>
                a.id === id ? automation : a
              ),
              isUpdating: false,
            }));

            return automation;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Unknown error",
              isUpdating: false,
            });
            return null;
          }
        },

        testAutomation: async (id, sampleData) => {
          set({ isTesting: true, error: null });

          try {
            const response = await fetch(`/api/v1/automations/${id}/test`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sample_data: sampleData }),
            });

            if (!response.ok) throw new Error("Failed to test automation");

            const result = await response.json();
            set({ isTesting: false });

            return result;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Unknown error",
              isTesting: false,
            });
            return null;
          }
        },

        fetchTemplates: async () => {
          set({ isLoading: true, error: null });

          try {
            const response = await fetch("/api/v1/automations/templates");
            if (!response.ok) throw new Error("Failed to fetch templates");

            const templates = await response.json();
            set({ templates, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Unknown error",
              isLoading: false,
            });
          }
        },

        cloneTemplate: async (templateId) => {
          set({ isCreating: true, error: null });

          try {
            const response = await fetch("/api/v1/automations/clone-template", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ template_id: templateId }),
            });

            if (!response.ok) throw new Error("Failed to clone template");

            const automation = await response.json();
            set((state) => ({
              automations: [automation, ...state.automations],
              isCreating: false,
            }));

            return automation;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Unknown error",
              isCreating: false,
            });
            return null;
          }
        },

        fetchRuns: async (automationId) => {
          set({ isLoading: true, error: null });

          try {
            const response = await fetch(
              `/api/v1/automations/${automationId}/runs`
            );
            if (!response.ok) throw new Error("Failed to fetch runs");

            const data = await response.json();
            set({ runs: data.items, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Unknown error",
              isLoading: false,
            });
          }
        },

        reset: () => set(initialState),
      }),
      {
        name: "automations-storage",
        partialize: (state) => ({
          filters: state.filters,
          pageSize: state.pageSize,
        }),
      }
    )
  )
);
