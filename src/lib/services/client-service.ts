import { ApiService } from "@/lib/api-service";
import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
  ClientResponse,
  ClientListResponse,
  ClientFilters,
  ClientSort,
} from "@/types";

export class ClientService {
  private static baseUrl = "/clients";

  /**
   * Create a new client
   */
  static async createClient(data: CreateClientInput): Promise<ClientResponse> {
    const response = await ApiService.post<ClientResponse>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Get all clients for the authenticated user
   */
  static async getClients(
    page: number = 1,
    filters?: ClientFilters,
    sort?: ClientSort,
  ): Promise<ClientListResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());

    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.isActive !== undefined) {
      params.append("is_active", filters.isActive.toString());
    }
    if (filters?.city) {
      params.append("city", filters.city);
    }
    if (sort) {
      params.append("sort", sort.field);
      params.append("direction", sort.direction);
    }

    const response = await ApiService.get<ClientListResponse>(
      `${this.baseUrl}?${params.toString()}`,
    );
    return response.data;
  }

  /**
   * Get a specific client by ID
   */
  static async getClient(id: number): Promise<{ client: Client }> {
    const response = await ApiService.get<{ client: Client }>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Update a client
   */
  static async updateClient(id: number, data: UpdateClientInput): Promise<ClientResponse> {
    const response = await ApiService.put<ClientResponse>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Delete a client (soft delete - marks as inactive)
   */
  static async deleteClient(id: number): Promise<{ message: string }> {
    const response = await ApiService.delete<{ message: string }>(`${this.baseUrl}/${id}`);
    return response.data;
  }
}
