import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Protected routes that require authentication.
 * Unauthenticated users will be redirected to the login page.
 */
const protectedRoutes = ["/dashboard", "/notes"];

/**
 * Check if a pathname matches any protected route.
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function middleware(request: NextRequest) {
  // Refresh session and get user
  const { user, supabaseResponse } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute(pathname) && !user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
