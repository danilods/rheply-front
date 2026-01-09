/**
 * Analytics API Client
 *
 * Frontend service for interacting with the ClickHouse Analytics API.
 * Provides real-time BI dashboards (D-0 latency) as per PRD Module 2.4.
 */

import { apiClient } from '@/lib/api';
import { AxiosResponse } from 'axios';

// =========================================
// Type Definitions
// =========================================

export interface DashboardSummary {
  open_jobs: number;
  active_candidates: number;
  applications_this_week: number;
  avg_time_to_hire: number;
  interviews_scheduled: number;
  offers_pending: number;
  last_updated: string;
}

export interface TimeToHireMetrics {
  avg_time_to_hire_days: number;
  min_days: number;
  max_days: number;
  total_hires: number;
  department: string | null;
}

export interface CostPerHireMetrics {
  cost_per_hire: number;
  total_cost: number;
  total_hires: number;
  cost_breakdown: Record<string, number>;
  currency: string;
}

export interface SourceEffectiveness {
  source: string;
  applications: number;
  qualified_applications: number;
  interviews: number;
  offers: number;
  hires: number;
  conversion_rate: number;
  quality_score: number;
  avg_time_to_hire_days: number;
  avg_cost_per_hire: number;
  roi: number;
}

export interface FunnelStage {
  stage: string;
  total: number;
  avg_hours: number;
  conversion_rate: number;
  drop_off_rate: number;
}

export interface ApplicationsTrend {
  date: string;
  applications: number;
}

export interface DepartmentBreakdown {
  department: string;
  jobs_opened: number;
  jobs_closed: number;
  applications_received: number;
  candidates_hired: number;
  avg_time_to_hire_days: number;
  avg_cost_per_hire: number;
  offer_acceptance_rate: number;
}

export interface BadHireMetrics {
  bad_hire_rate: number;
  total_hires: number;
  bad_hires: number;
  avg_days_employed: number;
  termination_reasons: Record<string, number>;
}

export interface ENPSMetrics {
  enps_score: number;
  total_responses: number;
  promoters: number;
  passives: number;
  detractors: number;
  avg_overall_rating: number;
  breakdown: Record<string, number>;
  would_reapply_pct: number;
  would_recommend_pct: number;
}

export interface PeriodComparison {
  period1: {
    start: string;
    end: string;
  };
  period2: {
    start: string;
    end: string;
  };
  comparison: Record<
    string,
    {
      period1: number;
      period2: number;
      absolute_change: number;
      percentage_change: number;
    }
  >;
}

export interface ExportResponse {
  company_id: string;
  exported_at: string;
  format: string;
  data: Record<string, unknown>;
}

export interface AnalyticsHealthCheck {
  status: string;
  clickhouse_connected: boolean;
  version?: string;
  error?: string;
}

export interface CompareRequest {
  period1_start: string;
  period1_end: string;
  period2_start: string;
  period2_end: string;
  metrics?: string[];
}

export interface DateRangeParams {
  date_from?: string;
  date_to?: string;
}

export interface TimeToHireParams extends DateRangeParams {
  company_id: string;
  department?: string;
}

export interface FunnelParams extends DateRangeParams {
  company_id: string;
  job_id?: string;
}

// =========================================
// Analytics API Service
// =========================================

const BASE_PATH = '/v1/analytics';

export const analyticsApi = {
  /**
   * Check analytics service health
   */
  checkHealth: (): Promise<AxiosResponse<AnalyticsHealthCheck>> =>
    apiClient.get(`${BASE_PATH}/health`),

  /**
   * Get main dashboard KPIs (real-time D-0)
   */
  getDashboard: (companyId: string): Promise<AxiosResponse<DashboardSummary>> =>
    apiClient.get(`${BASE_PATH}/dashboard`, {
      params: { company_id: companyId },
    }),

  /**
   * Get time to hire metrics
   */
  getTimeToHire: (
    params: TimeToHireParams
  ): Promise<AxiosResponse<TimeToHireMetrics>> =>
    apiClient.get(`${BASE_PATH}/time-to-hire`, { params }),

  /**
   * Get cost per hire metrics
   */
  getCostPerHire: (
    params: TimeToHireParams
  ): Promise<AxiosResponse<CostPerHireMetrics>> =>
    apiClient.get(`${BASE_PATH}/cost-per-hire`, { params }),

  /**
   * Get source effectiveness analysis
   */
  getSourceEffectiveness: (
    companyId: string,
    dateRange?: DateRangeParams
  ): Promise<AxiosResponse<SourceEffectiveness[]>> =>
    apiClient.get(`${BASE_PATH}/source-effectiveness`, {
      params: { company_id: companyId, ...dateRange },
    }),

  /**
   * Get hiring funnel metrics
   */
  getFunnel: (
    params: FunnelParams
  ): Promise<AxiosResponse<FunnelStage[]>> =>
    apiClient.get(`${BASE_PATH}/funnel`, { params }),

  /**
   * Get applications trend over time
   */
  getApplicationsTrend: (
    companyId: string,
    days: number = 30
  ): Promise<AxiosResponse<ApplicationsTrend[]>> =>
    apiClient.get(`${BASE_PATH}/applications-trend`, {
      params: { company_id: companyId, days },
    }),

  /**
   * Get metrics breakdown by department
   */
  getDepartmentBreakdown: (
    companyId: string,
    dateRange?: DateRangeParams
  ): Promise<AxiosResponse<DepartmentBreakdown[]>> =>
    apiClient.get(`${BASE_PATH}/department-breakdown`, {
      params: { company_id: companyId, ...dateRange },
    }),

  /**
   * Get bad hire rate (quality of hire)
   */
  getBadHireRate: (
    companyId: string,
    dateRange?: DateRangeParams
  ): Promise<AxiosResponse<BadHireMetrics>> =>
    apiClient.get(`${BASE_PATH}/bad-hire-rate`, {
      params: { company_id: companyId, ...dateRange },
    }),

  /**
   * Get eNPS (Employee Net Promoter Score)
   */
  getENPS: (
    companyId: string,
    dateRange?: DateRangeParams
  ): Promise<AxiosResponse<ENPSMetrics>> =>
    apiClient.get(`${BASE_PATH}/enps`, {
      params: { company_id: companyId, ...dateRange },
    }),

  /**
   * Export analytics data as JSON
   */
  exportData: (
    companyId: string,
    exportType: string = 'csv',
    metrics?: string
  ): Promise<AxiosResponse<ExportResponse>> =>
    apiClient.get(`${BASE_PATH}/export`, {
      params: { company_id: companyId, export_type: exportType, metrics },
    }),

  /**
   * Download analytics data as file (CSV/Excel)
   */
  downloadExport: (
    companyId: string,
    exportType: string = 'csv'
  ): Promise<AxiosResponse<Blob>> =>
    apiClient.get(`${BASE_PATH}/export/download`, {
      params: { company_id: companyId, export_type: exportType },
      responseType: 'blob',
    }),

  /**
   * Compare metrics between two time periods
   */
  comparePeriods: (
    companyId: string,
    request: CompareRequest
  ): Promise<AxiosResponse<PeriodComparison>> =>
    apiClient.post(`${BASE_PATH}/compare`, request, {
      params: { company_id: companyId },
    }),
};

// =========================================
// Utility Functions
// =========================================

/**
 * Format a number as currency (BRL)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Format a percentage value
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format days into a human-readable string
 */
export const formatDays = (days: number): string => {
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  const roundedDays = Math.round(days);
  return `${roundedDays} day${roundedDays !== 1 ? 's' : ''}`;
};

/**
 * Get eNPS category based on score
 */
export const getENPSCategory = (score: number): string => {
  if (score >= 50) return 'Excellent';
  if (score >= 30) return 'Good';
  if (score >= 0) return 'Average';
  if (score >= -30) return 'Poor';
  return 'Critical';
};

/**
 * Get color for eNPS score
 */
export const getENPSColor = (score: number): string => {
  if (score >= 50) return 'text-green-600';
  if (score >= 30) return 'text-green-500';
  if (score >= 0) return 'text-yellow-500';
  if (score >= -30) return 'text-orange-500';
  return 'text-red-500';
};

/**
 * Get funnel stage display name
 */
export const getStageName = (stage: string): string => {
  const stageNames: Record<string, string> = {
    applied: 'Applied',
    screened: 'Screened',
    interviewed: 'Interviewed',
    offered: 'Offered',
    hired: 'Hired',
  };
  return stageNames[stage] || stage;
};

/**
 * Calculate period-over-period change indicator
 */
export const getChangeIndicator = (
  change: number,
  inverse: boolean = false
): { color: string; icon: string; text: string } => {
  const isPositive = inverse ? change < 0 : change > 0;
  const isNeutral = Math.abs(change) < 0.01;

  if (isNeutral) {
    return {
      color: 'text-gray-500',
      icon: 'minus',
      text: 'No change',
    };
  }

  if (isPositive) {
    return {
      color: 'text-green-600',
      icon: 'trending-up',
      text: `+${change.toFixed(1)}%`,
    };
  }

  return {
    color: 'text-red-600',
    icon: 'trending-down',
    text: `${change.toFixed(1)}%`,
  };
};

export default analyticsApi;
