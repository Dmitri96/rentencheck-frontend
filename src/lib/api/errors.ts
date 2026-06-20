/**
 * Typed helpers for inspecting openapi-fetch responses.
 *
 * Most callers should pattern-match on `error` returned from `api.GET/POST/...`.
 * These helpers add ergonomic guards for the common cases.
 */

export type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
};

export type ApiResult<T> = { data: T; error?: undefined } | { data?: undefined; error: ApiError };

export function isValidationError(error: ApiError | undefined): boolean {
  return !!error?.errors && typeof error.errors === "object";
}

export function getErrorMessage(
  error: ApiError | undefined,
  fallback = "An error occurred",
): string {
  if (!error) return fallback;
  if (typeof error.message === "string" && error.message.length > 0) return error.message;
  return fallback;
}

/**
 * Flattens Laravel-style { field: [msg, ...] } validation errors into a single string array.
 */
export function getValidationMessages(error: ApiError | undefined): string[] {
  if (!isValidationError(error)) return [];
  const map = error!.errors as Record<string, string[]>;
  return Object.values(map).flat();
}
