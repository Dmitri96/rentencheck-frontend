import { ApiService } from '../api-service'
import {
  AdminDashboardData,
  Advisor,
  AdvisorDetails,
  CreateAdvisorInput,
  ApiError
} from '../../types/auth'

interface GetAdvisorsParams {
  status?: 'all' | 'active' | 'blocked'
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

interface UpdateAdvisorStatusInput {
  status: 'active' | 'blocked'
}

interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export class AdminService {
  /**
   * Get admin dashboard overview data
   */
  static async getDashboard(): Promise<AdminDashboardData> {
    try {
      const response = await ApiService.get<AdminDashboardData>('/admin/dashboard')
      return response.data
    } catch (error) {
      console.error('Error fetching admin dashboard:', error)
      throw this.handleApiError(error)
    }
  }

  /**
   * Get all financial advisors with pagination and filtering
   */
  static async getAdvisors(params: GetAdvisorsParams = {}): Promise<PaginatedResponse<Advisor>> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.status && params.status !== 'all') {
        queryParams.append('status', params.status)
      }
      if (params.search) {
        queryParams.append('search', params.search)
      }
      if (params.sort_by) {
        queryParams.append('sort_by', params.sort_by)
      }
      if (params.sort_order) {
        queryParams.append('sort_order', params.sort_order)
      }
      if (params.per_page) {
        queryParams.append('per_page', params.per_page.toString())
      }
      if (params.page) {
        queryParams.append('page', params.page.toString())
      }

      const url = `/admin/advisors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await ApiService.get<PaginatedResponse<Advisor>>(url)
      return response.data
    } catch (error) {
      console.error('Error fetching advisors:', error)
      throw this.handleApiError(error)
    }
  }

  /**
   * Get detailed advisor information with statistics
   */
  static async getAdvisorDetails(advisorId: number): Promise<AdvisorDetails> {
    try {
      const response = await ApiService.get<AdvisorDetails>(`/admin/advisors/${advisorId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching advisor details:', error)
      throw this.handleApiError(error)
    }
  }

  /**
   * Create a new financial advisor
   */
  static async createAdvisor(data: CreateAdvisorInput): Promise<{ advisor: Advisor; message: string }> {
    try {
      const response = await ApiService.post<{ advisor: Advisor; message: string }>('/admin/advisors', data)
      return response.data
    } catch (error) {
      console.error('Error creating advisor:', error)
      throw this.handleApiError(error)
    }
  }

  /**
   * Update advisor status (block/unblock)
   */
  static async updateAdvisorStatus(
    advisorId: number, 
    data: UpdateAdvisorStatusInput
  ): Promise<{ advisor: Advisor; message: string }> {
    try {
      const response = await ApiService.patch<{ advisor: Advisor; message: string }>(
        `/admin/advisors/${advisorId}/status`, 
        data
      )
      return response.data
    } catch (error) {
      console.error('Error updating advisor status:', error)
      throw this.handleApiError(error)
    }
  }

  /**
   * Delete an advisor
   */
  static async deleteAdvisor(advisorId: number): Promise<{ message: string }> {
    try {
      const response = await ApiService.delete<{ message: string }>(`/admin/advisors/${advisorId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting advisor:', error)
      throw this.handleApiError(error)
    }
  }

  /**
   * Block an advisor
   */
  static async blockAdvisor(advisorId: number): Promise<{ advisor: Advisor; message: string }> {
    return this.updateAdvisorStatus(advisorId, { status: 'blocked' })
  }

  /**
   * Unblock an advisor
   */
  static async unblockAdvisor(advisorId: number): Promise<{ advisor: Advisor; message: string }> {
    return this.updateAdvisorStatus(advisorId, { status: 'active' })
  }

  /**
   * Handle API errors consistently
   */
  private static handleApiError(error: any): ApiError {
    if (error.response?.data) {
      return {
        message: error.response.data.message || 'Ein Fehler ist aufgetreten',
        errors: error.response.data.errors
      }
    }

    if (error.message) {
      return {
        message: error.message
      }
    }

    return {
      message: 'Ein unbekannter Fehler ist aufgetreten'
    }
  }
} 