import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants/storage-keys";
import { PROTECTED_PREFIXES, AUTH_PREFIXES, ROUTES } from "@/lib/constants/routes";

/**
 * Route gate driven by the Sanctum SPA session cookie set by /api/auth/login.
 *
 * Detection: presence of `laravel_session` (configurable via SESSION_COOKIE).
 * Constants live in lib/constants/* so paths + cookie name don't drift between
 * middleware, redirects, and nav.
 */
export function middleware(request: NextRequest) {
  const isAuthed = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  const onProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const onAuth = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  if (onProtected && !isAuthed) {
    return NextResponse.redirect(new URL(ROUTES.login, request.url));
  }

  if (onAuth && isAuthed) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (Next.js API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
