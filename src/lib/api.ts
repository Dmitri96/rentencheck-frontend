import { AuthResponse, LoginInput, RegisterInput, User } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

/**
 * Creates headers with Authorization token if token is provided
 */
const createHeaders = (token?: string | null) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Registers a new user
 */
export const registerUser = async (data: RegisterInput): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
};

/**
 * Logs in a user
 */
export const loginUser = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
};

/**
 * Gets the current user
 */
export const getCurrentUser = async (token: string): Promise<{ user: User; message: string }> => {
  const response = await fetch(`${API_URL}/user`, {
    method: 'GET',
    headers: createHeaders(token),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to get user data');
  }

  return response.json();
};

/**
 * Logs out a user
 */
export const logoutUser = async (token: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    headers: createHeaders(token),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }

  return response.json();
}; 