import { api } from "@/lib/api";
import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
  ClientResponse,
  ClientListResponse,
  ClientFilters,
  ClientSort,
} from "@/types";
import type { components } from "@/lib/api/schema";

type ClientResource = components["schemas"]["ClientResource"];

function mapClientResource(r: ClientResource): Client {
  return {
    id: r.id,
    first_name: r.first_name,
    last_name: r.last_name,
    full_name: r.full_name,
    email: r.email,
    phone: r.phone ?? undefined,
    street: r.street ?? undefined,
    city: r.city ?? undefined,
    postal_code: r.postal_code ?? undefined,
    birth_date: r.birth_date || undefined,
    age: r.age ?? undefined,
    formatted_address: r.formatted_address,
    is_active: r.is_active,
    notes: r.notes ?? undefined,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export class ClientService {
  /**
   * Create a new client
   */
  static async createClient(data: CreateClientInput): Promise<ClientResponse> {
    const { data: responseData, error } = await api.POST("/clients", {
      body: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        street: data.street,
        city: data.city,
        postal_code: data.postal_code,
        birth_date: data.birth_date,
        notes: data.notes,
      },
    });

    if (error) throw error;

    return {
      client: mapClientResource(responseData.data),
      message: responseData.message,
    };
  }

  /**
   * Get all clients for the authenticated user with optional filtering and sorting
   */
  static async getClients(
    page: number = 1,
    filters?: ClientFilters,
    sort?: ClientSort,
  ): Promise<ClientListResponse> {
    // openapi-fetch doesn't support arbitrary query params for /clients
    // (schema has query?: never). Build URL manually so filtering works.
    const params = new URLSearchParams({ page: page.toString() });
    if (filters?.search) params.append("search", filters.search);
    if (filters?.isActive !== undefined) params.append("is_active", filters.isActive.toString());
    if (filters?.city) params.append("city", filters.city);
    if (sort) {
      params.append("sort", sort.field);
      params.append("direction", sort.direction);
    }

    // Fetch via native fetch to append query string not in schema
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ??
      (typeof window !== "undefined"
        ? `${window.location.origin}/api`
        : "http://localhost:8000/api");

    const xsrfMatch =
      typeof document !== "undefined"
        ? document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN="))
        : undefined;
    const xsrfToken = xsrfMatch ? decodeURIComponent(xsrfMatch.split("=")[1] ?? "") : "";

    const res = await fetch(`${baseUrl}/clients?${params.toString()}`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
      },
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(err.message ?? "Fehler beim Laden der Mandanten");
    }

    const json = (await res.json()) as {
      data: ClientResource[];
      links: ClientListResponse["links"];
      meta: ClientListResponse["meta"];
    };

    return {
      data: json.data.map(mapClientResource),
      current_page: json.meta.current_page,
      last_page: json.meta.last_page,
      per_page: json.meta.per_page,
      total: json.meta.total,
      links: json.links,
      meta: json.meta,
    };
  }

  /**
   * Get a specific client by ID
   */
  static async getClient(id: number): Promise<{ client: Client }> {
    const { data, error } = await api.GET("/clients/{client}", {
      params: { path: { client: id } },
    });

    if (error) throw error;

    return { client: mapClientResource(data.data) };
  }

  /**
   * Update a client
   */
  static async updateClient(id: number, clientData: UpdateClientInput): Promise<ClientResponse> {
    const { data, error } = await api.PUT("/clients/{client}", {
      params: { path: { client: id } },
      body: {
        first_name: clientData.first_name,
        last_name: clientData.last_name,
        email: clientData.email,
        phone: clientData.phone,
        street: clientData.street,
        city: clientData.city,
        postal_code: clientData.postal_code,
        birth_date: clientData.birth_date,
        notes: clientData.notes,
      },
    });

    if (error) throw error;

    return {
      client: mapClientResource(data.data),
      message: data.message,
    };
  }

  /**
   * Delete a client (soft delete — marks as inactive)
   */
  static async deleteClient(id: number): Promise<{ message: string }> {
    const { data, error } = await api.DELETE("/clients/{client}", {
      params: { path: { client: id } },
    });

    if (error) throw error;

    return { message: data.message };
  }
}
