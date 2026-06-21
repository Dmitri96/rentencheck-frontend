/**
 * localStorage keys used by the app.
 *
 * Phase 5 moved auth to Sanctum SPA cookies; AUTH_TOKEN_KEY remains here
 * for the transition (axios.ts + storage.ts still read it). Phase 7 deletes
 * axios.ts and we can drop AUTH_TOKEN_KEY entirely.
 */

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  AUTH_USER: "auth_user",
} as const;

export const SESSION_COOKIE = process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "laravel_session";
