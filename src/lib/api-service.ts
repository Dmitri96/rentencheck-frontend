import apiClient from './axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Generic API Service
 * Provides methods for common API operations
 */
export const ApiService = {
  /**
   * Make a GET request
   */
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return apiClient.get<T>(url, config);
  },

  /**
   * Make a POST request
   */
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return apiClient.post<T>(url, data, config);
  },

  /**
   * Make a PUT request
   */
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return apiClient.put<T>(url, data, config);
  },

  /**
   * Make a PATCH request
   */
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return apiClient.patch<T>(url, data, config);
  },

  /**
   * Make a DELETE request
   */
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return apiClient.delete<T>(url, config);
  }
};

export default ApiService; 