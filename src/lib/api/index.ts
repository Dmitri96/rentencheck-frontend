/**
 * Public surface of the typed API layer.
 *
 * Import from this barrel; do NOT reach into `./client`, `./schema`, etc. directly.
 */
export { api } from "./client";
export type { paths, components } from "./schema";
export type { ApiError, ApiResult } from "./errors";
export { getErrorMessage, getValidationMessages, isValidationError } from "./errors";
