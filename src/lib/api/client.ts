/**
 * Typed API client backed by OpenAPI spec.
 *
 * Schema is generated from ../rentencheck-backend/openapi.json via `bun run api:types`.
 * `api.GET("/clients/{id}", ...)` infers path params, query, body, and response shape.
 *
 * Auth strategy (phase 5 onward):
 * 1. Sanctum SPA session cookie (set by /api/auth/login + warmed via /sanctum/csrf-cookie).
 * 2. XSRF-TOKEN cookie sent back as X-XSRF-TOKEN header on mutating requests.
 *
 * The legacy bearer token middleware is intentionally absent here. The
 * legacy `src/lib/axios.ts` still attaches Authorization headers for
 * components that haven't migrated; both auth paths coexist until phase 7.
 */
import createClient, { type Middleware } from "openapi-fetch";

import type { paths } from "./schema";

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost:8000/api");

/**
 * Reads the XSRF-TOKEN cookie set by /sanctum/csrf-cookie and forwards it
 * as the X-XSRF-TOKEN header on mutating requests. Sanctum's stateful
 * middleware uses it to validate CSRF on POST/PUT/PATCH/DELETE.
 */
const csrfTokenMiddleware: Middleware = {
  onRequest({ request }) {
    if (typeof document === "undefined") return undefined;

    const method = request.method.toUpperCase();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") return undefined;

    const match = document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN="));
    if (match) {
      const token = decodeURIComponent(match.split("=")[1] ?? "");
      if (token) {
        request.headers.set("X-XSRF-TOKEN", token);
      }
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

api.use(csrfTokenMiddleware);
