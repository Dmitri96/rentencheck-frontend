/**
 * Sanctum SPA CSRF cookie warm-up.
 *
 * Call `ensureCsrfCookie()` once before the first mutating request of a session.
 * It hits `/sanctum/csrf-cookie` which sets the XSRF-TOKEN cookie; the typed
 * client (lib/api/client.ts) then forwards it as X-XSRF-TOKEN on every
 * subsequent POST/PUT/PATCH/DELETE.
 *
 * Safe to call multiple times — Sanctum just sets the cookie again.
 */

let warmed = false;

export async function ensureCsrfCookie(): Promise<void> {
  if (warmed) return;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    (typeof window !== "undefined" ? `${window.location.origin}/api` : "");

  // /sanctum/csrf-cookie lives outside /api in Laravel's routing.
  const origin = baseUrl.replace(/\/api\/?$/, "");

  await fetch(`${origin}/sanctum/csrf-cookie`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  warmed = true;
}

/** For tests / logout: force the next mutating request to warm again. */
export function resetCsrfCookieCache(): void {
  warmed = false;
}
