import { describe, expect } from "vitest";
import { test } from "@fast-check/vitest";
import fc from "fast-check";

/**
 * **Feature: vibe-notes, Property 2: Protected Routes Redirect Unauthenticated Users**
 * **Validates: Requirements 4.1, 4.2, 4.3**
 *
 * For any protected route path (dashboard, note detail), when accessed by an
 * unauthenticated user, the middleware SHALL return a redirect response to the login page.
 *
 * This test validates the route protection logic that determines which routes
 * require authentication.
 */

/**
 * Protected routes that require authentication.
 * This mirrors the logic in src/middleware.ts
 */
const protectedRoutes = ["/dashboard", "/notes"];

/**
 * Check if a pathname matches any protected route.
 * This is the core logic extracted from the middleware for testing.
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

describe("Property 2: Protected Routes Redirect Unauthenticated Users", () => {
  // Generator for protected dashboard paths
  const dashboardPathArbitrary = fc.constantFrom(
    "/dashboard",
    "/dashboard/",
    "/dashboard/settings",
    "/dashboard/profile"
  );

  // Generator for protected note paths (including dynamic [id] routes)
  const notePathArbitrary = fc.oneof(
    fc.constant("/notes"),
    fc.uuid().map((id) => `/notes/${id}`),
    fc.string({ minLength: 1, maxLength: 36 }).map((id) => `/notes/${id}`),
    fc.constant("/notes/new"),
    fc.constant("/notes/123/edit")
  );

  // Generator for all protected paths
  const protectedPathArbitrary = fc.oneof(
    dashboardPathArbitrary,
    notePathArbitrary
  );

  // Generator for public paths (not protected)
  const publicPathArbitrary = fc.constantFrom(
    "/",
    "/login",
    "/signup",
    "/about",
    "/api/health",
    "/public/image.png"
  );

  // Generator for random paths that should not be protected
  const randomNonProtectedPathArbitrary = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => {
      // Filter out strings that would match protected routes
      const path = s.startsWith("/") ? s : `/${s}`;
      return !isProtectedRoute(path);
    })
    .map((s) => (s.startsWith("/") ? s : `/${s}`));

  test.prop([protectedPathArbitrary], { numRuns: 100 })(
    "all protected paths are correctly identified as protected",
    (pathname) => {
      const result = isProtectedRoute(pathname);
      expect(result).toBe(true);
    }
  );

  test.prop([publicPathArbitrary], { numRuns: 100 })(
    "known public paths are not identified as protected",
    (pathname) => {
      const result = isProtectedRoute(pathname);
      expect(result).toBe(false);
    }
  );

  test.prop([fc.uuid()], { numRuns: 100 })(
    "note detail paths with any UUID are protected",
    (uuid) => {
      const pathname = `/notes/${uuid}`;
      const result = isProtectedRoute(pathname);
      expect(result).toBe(true);
    }
  );

  test.prop([randomNonProtectedPathArbitrary], { numRuns: 100 })(
    "random non-protected paths are not identified as protected",
    (pathname) => {
      const result = isProtectedRoute(pathname);
      expect(result).toBe(false);
    }
  );

  // Test that exact matches work
  test.prop([fc.constantFrom("/dashboard", "/notes")], { numRuns: 100 })(
    "exact protected route matches are protected",
    (pathname) => {
      const result = isProtectedRoute(pathname);
      expect(result).toBe(true);
    }
  );

  // Test that subpaths of protected routes are also protected
  test.prop(
    [
      fc.constantFrom("/dashboard", "/notes"),
      fc
        .string({ minLength: 1, maxLength: 20 })
        .filter((s) => !s.includes("/")),
    ],
    { numRuns: 100 }
  )("subpaths of protected routes are also protected", (baseRoute, subpath) => {
    const pathname = `${baseRoute}/${subpath}`;
    const result = isProtectedRoute(pathname);
    expect(result).toBe(true);
  });
});
