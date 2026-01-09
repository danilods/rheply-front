// Candidate API client
// TODO: Implement actual API calls when backend is ready

import { apiClient } from './api';

class CandidateApiClient {
  async get<T>(url: string): Promise<T> {
    const response = await apiClient.get<T>(`/candidate${url}`);
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await apiClient.post<T>(`/candidate${url}`, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await apiClient.put<T>(`/candidate${url}`, data);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await apiClient.patch<T>(`/candidate${url}`, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await apiClient.delete<T>(`/candidate${url}`);
    return response.data;
  }

  async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const response = await apiClient.upload<T>(`/candidate${url}`, file, onProgress);
    return response.data;
  }

  async uploadFile<T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    const response = await apiClient.uploadFormData<T>(`/candidate${url}`, formData, onProgress);
    return response.data;
  }

  async downloadBlob(url: string): Promise<Blob> {
    const response = await apiClient.downloadBlob(`/candidate${url}`);
    return response.data;
  }
}

export const candidateApiClient = new CandidateApiClient();
