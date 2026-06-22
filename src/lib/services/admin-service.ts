import { api } from "@/lib/api";
import type {
  AdminDashboardData,
  Advisor,
  AdvisorDetails,
  CreateAdvisorInput,
  ApiError,
} from "../../types/auth";
import type { components } from "@/lib/api/schema";

// TODO Wave 3C: AdvisorResource has string-typed numeric fields (id, total_clients…).
// Narrow the schema types here until backend Resource annotations land.
type AdvisorResource = components["schemas"]["AdvisorResource"];
type AdvisorDetailResource = components["schemas"]["AdvisorDetailResource"];
type DashboardOverviewResource = components["schemas"]["DashboardOverviewResource"];

interface GetAdvisorsParams {
  status?: "all" | "active" | "blocked";
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

interface UpdateAdvisorStatusInput {
  status: "active" | "blocked";
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

function mapAdvisorResource(r: AdvisorResource): Advisor {
  return {
    id: Number(r.id),
    name: r.name,
    first_name: r.first_name,
    last_name: r.last_name,
    email: r.email,
    phone: r.phone || undefined,
    company: r.company || undefined,
    status: r.status as Advisor["status"],
    created_at: r.created_at,
    last_login: r.last_login || undefined,
    statistics: {
      total_clients: Number(r.statistics.total_clients),
      total_rentenchecks: Number(r.statistics.total_rentenchecks),
      completed_rentenchecks: Number(r.statistics.completed_rentenchecks),
      completion_rate: r.statistics.completion_rate,
    },
  };
}

function handleApiError(error: unknown): ApiError {
  const err = error as Record<string, unknown>;
  const responseData = err["response"] as Record<string, unknown> | undefined;
  const data = responseData?.["data"] as Record<string, unknown> | undefined;

  if (data) {
    return {
      message: (data["message"] as string) || "Ein Fehler ist aufgetreten",
      errors: data["errors"] as Record<string, string[]> | undefined,
    };
  }

  return {
    message: (err["message"] as string) || "Ein unbekannter Fehler ist aufgetreten",
  };
}

export class AdminService {
  /**
   * Get admin dashboard overview data
   */
  static async getDashboard(): Promise<AdminDashboardData> {
    const { data, error } = await api.GET("/admin/dashboard");

    if (error) {
      console.error("Error fetching admin dashboard:", error);
      throw handleApiError(error);
    }

    // TODO Wave 3C: DashboardOverviewResource has string-typed numeric fields.
    const overview = data.data.overview as DashboardOverviewResource["overview"];
    const recentActivity = data.data
      .recent_activity as unknown as AdminDashboardData["recent_activity"];

    return {
      overview: {
        total_advisors: Number(overview.total_advisors),
        active_advisors: Number(overview.active_advisors),
        blocked_advisors: Number(overview.blocked_advisors),
        total_clients: Number(overview.total_clients),
        total_rentenchecks: Number(overview.total_rentenchecks),
        completed_rentenchecks: Number(overview.completed_rentenchecks),
        completion_rate: Number(overview.completion_rate),
      },
      recent_activity: recentActivity ?? [],
    };
  }

  /**
   * Get all financial advisors with pagination and filtering
   */
  static async getAdvisors(params: GetAdvisorsParams = {}): Promise<PaginatedResponse<Advisor>> {
    const { status, search, sort_by, sort_order, per_page, page } = params;

    const { data, error } = await api.GET("/admin/advisors", {
      params: {
        query: {
          status: status !== "all" ? status : undefined,
          search: search || undefined,
          sort_by: sort_by as "created_at" | "name" | "email" | "status" | undefined,
          sort_order,
          per_page,
          page,
        },
      },
    });

    if (error) {
      console.error("Error fetching advisors:", error);
      throw handleApiError(error);
    }

    const advisors = (data.data as AdvisorResource[]).map(mapAdvisorResource);

    return {
      data: advisors,
      current_page: data.meta.current_page,
      last_page: data.meta.last_page,
      per_page: data.meta.per_page,
      total: data.meta.total,
      from: data.meta.from ?? 0,
      to: data.meta.to ?? 0,
    };
  }

  /**
   * Get detailed advisor information with statistics
   */
  static async getAdvisorDetails(advisorId: number): Promise<AdvisorDetails> {
    const { data, error } = await api.GET("/admin/advisors/{advisorId}", {
      params: { path: { advisorId } },
    });

    if (error) {
      console.error("Error fetching advisor details:", error);
      throw handleApiError(error);
    }

    // TODO Wave 3C: AdvisorDetailResource has `statistics` and `monthly_stats` typed as `string`.
    const resource = data.data as AdvisorDetailResource;
    const stats = resource.statistics as unknown as AdvisorDetails["statistics"];
    const monthlyStats = resource.monthly_stats as unknown as AdvisorDetails["monthly_stats"];
    const recentClients = resource.recent_clients as unknown as AdvisorDetails["recent_clients"];

    return {
      advisor: {
        id: Number(resource.advisor.id),
        name: resource.advisor.name,
        first_name: resource.advisor.first_name,
        last_name: resource.advisor.last_name,
        email: resource.advisor.email,
        phone: resource.advisor.phone || undefined,
        company: resource.advisor.company || undefined,
        status: resource.advisor.status as Advisor["status"],
        created_at: resource.advisor.created_at,
        statistics: {
          total_clients: 0,
          total_rentenchecks: 0,
          completed_rentenchecks: 0,
          completion_rate: 0,
        },
      },
      statistics: stats ?? {
        total_clients: 0,
        total_rentenchecks: 0,
        completed_rentenchecks: 0,
        pending_rentenchecks: 0,
        completion_rate: 0,
      },
      monthly_stats: monthlyStats ?? [],
      recent_clients: recentClients ?? [],
    };
  }

  /**
   * Create a new financial advisor
   */
  static async createAdvisor(
    advisorData: CreateAdvisorInput,
  ): Promise<{ advisor: Advisor; message: string }> {
    const { data, error } = await api.POST("/admin/advisors", {
      body: {
        first_name: advisorData.first_name,
        last_name: advisorData.last_name,
        email: advisorData.email,
        phone: advisorData.phone,
        company: advisorData.company,
        password: advisorData.password,
        password_confirmation: advisorData.password_confirmation,
      },
    });

    if (error) {
      console.error("Error creating advisor:", error);
      throw handleApiError(error);
    }

    const created = data.data.advisor;

    return {
      advisor: {
        id: Number(created.id),
        name: created.name,
        first_name: created.name,
        last_name: "",
        email: created.email,
        status: created.status as Advisor["status"],
        created_at: new Date().toISOString(),
        statistics: {
          total_clients: 0,
          total_rentenchecks: 0,
          completed_rentenchecks: 0,
          completion_rate: 0,
        },
      },
      message: data.message,
    };
  }

  /**
   * Update advisor status (block/unblock)
   */
  static async updateAdvisorStatus(
    advisorId: number,
    advisorData: UpdateAdvisorStatusInput,
  ): Promise<{ advisor: Advisor; message: string }> {
    const { data, error } = await api.PATCH("/admin/advisors/{advisorId}/status", {
      params: { path: { advisorId } },
      body: { status: advisorData.status },
    });

    if (error) {
      console.error("Error updating advisor status:", error);
      throw handleApiError(error);
    }

    const updated = data.data.advisor;

    return {
      advisor: {
        id: Number(updated.id),
        name: updated.name,
        first_name: updated.name,
        last_name: "",
        email: updated.email,
        status: updated.status as Advisor["status"],
        created_at: new Date().toISOString(),
        statistics: {
          total_clients: 0,
          total_rentenchecks: 0,
          completed_rentenchecks: 0,
          completion_rate: 0,
        },
      },
      message: data.message,
    };
  }

  /**
   * Delete an advisor
   */
  static async deleteAdvisor(advisorId: number): Promise<{ message: string }> {
    const { data, error } = await api.DELETE("/admin/advisors/{advisorId}", {
      params: { path: { advisorId } },
    });

    if (error) {
      console.error("Error deleting advisor:", error);
      throw handleApiError(error);
    }

    return { message: data.message };
  }

  /** Block an advisor */
  static async blockAdvisor(advisorId: number): Promise<{ advisor: Advisor; message: string }> {
    return this.updateAdvisorStatus(advisorId, { status: "blocked" });
  }

  /** Unblock an advisor */
  static async unblockAdvisor(advisorId: number): Promise<{ advisor: Advisor; message: string }> {
    return this.updateAdvisorStatus(advisorId, { status: "active" });
  }
}
