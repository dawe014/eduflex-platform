import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

export default withAuth(
  // The first argument is our custom middleware for role-based checks.
  // This part runs ONLY IF the user is already successfully authenticated.
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;
    const userRole = token?.role as UserRole;

    // --- Role-Based Authorization ---

    // 1. Admin Routes
    if (pathname.startsWith("/admin")) {
      if (userRole !== "ADMIN") {
        // If a logged-in user is not an admin, send them to their dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // 2. Instructor Routes
    if (pathname.startsWith("/instructor")) {
      if (userRole !== "INSTRUCTOR") {
        // If a logged-in user is not an instructor, send them to their dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // If no specific role-based rules are broken, allow the request
    return NextResponse.next();
  },

  // The second argument is the configuration object for `withAuth`.
  {
    callbacks: {
      // This callback determines if the user is considered "authorized".
      // If this returns false, the user is redirected.
      authorized: ({ token }) => !!token,
    },

    // --- THIS IS THE KEY CHANGE ---
    // Tell `withAuth` where to redirect unauthorized users.
    pages: {
      signIn: "/login", // Redirects users who are not logged in to the /login page
    },
  }
);

// This config specifies which routes the middleware should protect.
export const config = {
  matcher: [
    // Admin Routes
    "/admin/:path*",

    // Instructor Routes
    "/instructor/:path*",

    // Student/Common Authenticated Routes
    "/dashboard",
    "/learning",
    "/wishlist",
    "/certificates",
    "/profile",
    "/settings",
    "/billing",

    // NOTE: The course player itself is a protected route.
    "/courses/:courseId/learn/:path*",
  ],
};
