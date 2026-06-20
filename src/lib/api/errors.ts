/**
 * Typed helpers for inspecting openapi-fetch responses.
 *
 * Most callers should pattern-match on `error` returned from `api.GET/POST/...`.
 * These helpers add ergonomic guards for the common cases.
 */

export type ApiError = {
  message?: string;
  errors?: Record<string, string | string[]>;
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
 * Flattens Laravel-style { field: string | string[] } validation errors into
 * a single string array. Defensive against custom validators that return a
 * single string instead of an array.
 */
export function getValidationMessages(error: ApiError | undefined): string[] {
  const errors = error?.errors;
  if (!errors || typeof errors !== "object") return [];
  return Object.values(errors).flatMap((value) => (Array.isArray(value) ? value : [String(value)]));
}
