/**
 * Auth is Sanctum SPA session-cookie based. The session cookie name is used
 * by the Next.js middleware to detect authentication server-side.
 */
export const SESSION_COOKIE = process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "laravel_session";
