export interface User {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  plan?: string;
  status: "active" | "blocked" | "pending";
  newsletter?: boolean;
  roles?: string[];
  is_admin: boolean;
  is_advisor: boolean;
  is_active: boolean;
  is_blocked: boolean;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  plan: string;
  password: string;
  password_confirmation: string;
  accept_terms: boolean;
  accept_privacy: boolean;
  newsletter?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  permissions?: string[];
  message: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Admin-specific types
export interface AdvisorStatistics {
  total_clients: number;
  total_rentenchecks: number;
  completed_rentenchecks: number;
  completion_rate: number;
}

export interface Advisor {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  status: "active" | "blocked" | "pending";
  created_at: string;
  last_login?: string;
  statistics: AdvisorStatistics;
}

export interface DashboardOverview {
  total_advisors: number;
  active_advisors: number;
  blocked_advisors: number;
  total_clients: number;
  total_rentenchecks: number;
  completed_rentenchecks: number;
  completion_rate: number;
}

export interface RecentActivity {
  id: number;
  client_name: string;
  advisor_name: string;
  is_completed: boolean;
  created_at: string;
}

export interface AdminDashboardData {
  overview: DashboardOverview;
  recent_activity: RecentActivity[];
}

export interface CreateAdvisorInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  password: string;
  password_confirmation: string;
}

export interface MonthlyStats {
  month: string;
  total: number;
  completed: number;
}

export interface AdvisorDetails {
  advisor: Advisor;
  statistics: {
    total_clients: number;
    total_rentenchecks: number;
    completed_rentenchecks: number;
    pending_rentenchecks: number;
    completion_rate: number;
    avg_completion_time?: number | null;
  };
  monthly_stats: MonthlyStats[];
  recent_clients: {
    id: number;
    name: string;
    email: string;
    rentenchecks_count: number;
    created_at: string;
  }[];
}
