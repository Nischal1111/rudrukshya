// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Define protected routes
  const protectedRoutes = [
    "/dashboard",
    "/products",
    "/review",
    "/services",
    "/user",
    "/product-reviews",
  ]; // Add your protected routes here

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If the route is protected and there's no token, redirect to the login page
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed if the route is not protected or the user is authenticated
  return NextResponse.next();
}

// Define the routes where the middleware should run
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products:path*",
    "/review:path*",
    "/services:path*",
    "/user:path*",
    "/product-reviews:path*",
  ], // Add your protected routes here
};
