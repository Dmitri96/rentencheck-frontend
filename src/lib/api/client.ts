/**
 * Typed API client backed by OpenAPI spec.
 *
 * - Schema is generated from ../rentencheck-backend/openapi.json via `bun run api:types`.
 * - `api.GET("/clients/{id}", ...)` infers path params, query, body, and response shape.
 * - Auth currently passes a bearer token from localStorage (legacy).
 *   Phase 5 swaps the middleware for Sanctum SPA cookies and removes localStorage usage.
 */
import createClient, { type Middleware } from "openapi-fetch";

import type { paths } from "./schema";

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost:8000/api");

/**
 * Injects bearer token from localStorage on each request.
 * Legacy auth; Phase 5 replaces this with cookie-based Sanctum SPA.
 */
const bearerTokenMiddleware: Middleware = {
  onRequest({ request }) {
    if (typeof window === "undefined") return undefined;
    const token = window.localStorage.getItem("auth_token");
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
};

export const api = createClient<paths>({
  baseUrl,
  credentials: "include",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.use(bearerTokenMiddleware);
