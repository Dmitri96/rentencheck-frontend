/**
 * Client Types
 * Centralized type definitions for client-related data structures
 */

export interface Client {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone?: string
  street?: string
  city?: string
  postal_code?: string
  birth_date?: string
  age?: number
  formatted_address: string
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateClientInput {
  first_name: string
  last_name: string
  email: string
  phone?: string
  street?: string
  city?: string
  postal_code?: string
  birth_date?: string
  notes?: string
}

export interface UpdateClientInput extends CreateClientInput {
  // Same as CreateClientInput for now, but allows for future differences
}

// Frontend form data now matches backend API format exactly
export interface ClientFormData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  street?: string
  city?: string
  postal_code?: string
  birth_date?: string
  notes?: string
}

export interface ClientResponse {
  client: Client
  message: string
}

export interface ClientListResponse {
  data: Client[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

export interface ClientFilters {
  search?: string
  isActive?: boolean
  city?: string
  page?: number
}

// Utility types for client operations
export type ClientSortField = 'first_name' | 'last_name' | 'email' | 'created_at'
export type SortDirection = 'asc' | 'desc'

export interface ClientSort {
  field: ClientSortField
  direction: SortDirection
} 