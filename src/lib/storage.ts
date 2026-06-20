/**
 * Storage utility for managing auth tokens and user data
 */

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// Check if code is running on the client side
const isClient = typeof window !== "undefined";

/**
 * Safely saves auth token to local storage
 */
export const saveToken = (token: string): void => {
  if (isClient) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error("Error saving token to localStorage:", error);
    }
  }
};

/**
 * Safely retrieves auth token from local storage
 */
export const getToken = (): string | null => {
  if (isClient) {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token from localStorage:", error);
    }
  }
  return null;
};

/**
 * Safely saves user data to local storage
 */
export const saveUser = (user: any): void => {
  if (isClient) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user to localStorage:", error);
    }
  }
};

/**
 * Safely retrieves user data from local storage
 */
export const getUser = (): any | null => {
  if (isClient) {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error getting user from localStorage:", error);
      return null;
    }
  }
  return null;
};

/**
 * Safely clears auth data from local storage
 */
export const clearAuth = (): void => {
  if (isClient) {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Error clearing auth from localStorage:", error);
    }
  }
};
