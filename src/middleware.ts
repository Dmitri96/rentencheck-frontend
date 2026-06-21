import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route gate driven by the Sanctum SPA session cookie set by /api/auth/login.
 *
 * Detection: presence of `laravel_session` (configurable via SESSION_COOKIE in
 * the backend). This is the same cookie the backend uses for stateful auth,
 * so middleware + backend agree on the auth state.
 *
 * The Next.js route group folder names `(auth)` and `(protected-pages)` get
 * STRIPPED from URLs at build time, so they never appear in pathname. Match
 * the public paths directly instead.
 */

const SESSION_COOKIE = process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "laravel_session";

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_PREFIXES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const isAuthed = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  const onProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const onAuth = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  if (onProtected && !isAuthed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (onAuth && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
