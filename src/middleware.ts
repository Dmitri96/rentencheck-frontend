import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * TODO(phase-5): currently effectively a no-op.
 *
 * 1. token is read from a cookie named "auth_token" but the auth flow writes to
 *    localStorage (src/hooks/useAuth.ts), so the cookie is never set today.
 * 2. Next.js route group names `(auth)` and `(protected-pages)` are stripped
 *    from URLs, so the startsWith checks never match.
 *
 * Phase 5 (Sanctum SPA cookies) rewrites both halves: switch the token store to
 * an httpOnly Sanctum session cookie and rewrite the protected-route match to
 * the actual public paths (`/dashboard`, `/login`, ...).
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const isAuthRoute = request.nextUrl.pathname.startsWith("/(auth)");
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/(protected-pages)");

  // If the user is trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If the user is logged in and trying to access an auth route (login/register), redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
