import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const encodedKey = new TextEncoder().encode(secretKey);

// Routes that don't require authentication
const publicRoutes = ["/login", "/register"];

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get("session");

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  // Verify session if cookie exists
  let isAuthenticated = false;
  if (sessionCookie?.value) {
    try {
      await jwtVerify(sessionCookie.value, encodedKey, {
        algorithms: ["HS256"],
      });
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Redirect authenticated users away from auth pages
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle root path
  if (path === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
