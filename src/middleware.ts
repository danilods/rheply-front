import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define auth routes (should redirect to dashboard if authenticated)
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookies or localStorage (via cookie)
  const token = request.cookies.get("auth-token")?.value;

  // Check if user has auth storage in localStorage (client-side)
  // Note: Middleware runs on server, so we check for a cookie that might be set
  const authStorageCookie = request.cookies.get("auth-storage")?.value;

  let isAuthenticated = false;

  // Try to parse auth storage if available
  if (authStorageCookie) {
    try {
      const authData = JSON.parse(authStorageCookie);
      isAuthenticated = !!(authData.state?.token && authData.state?.user);
    } catch {
      isAuthenticated = false;
    }
  }

  // Also check for explicit token cookie
  if (token) {
    isAuthenticated = true;
  }

  // Skip middleware for static files, API routes, and _next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // Static files like .ico, .png, etc.
  ) {
    return NextResponse.next();
  }

  // Handle root path
  if (pathname === "/") {
    // Redirect to dashboard if authenticated, otherwise to login
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if current route is a protected route (dashboard, etc.)
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    // Add redirect parameter to return user to their intended destination
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
