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

    // --- NEW: Force profile completion for new users ---
    // If the user's role is NEW_USER, they can ONLY access the complete-profile page.
    console.log("role:", userRole, "path:", pathname);
    if (userRole === "NEW_USER" && pathname !== "/register/complete-profile") {
      return NextResponse.redirect(
        new URL("/register/complete-profile", req.url)
      );
    }

    // If a completed user tries to access the completion page, redirect them away.
    if (userRole !== "NEW_USER" && pathname === "/register/complete-profile") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // --- Role-Based Authorization (remains the same) ---
    if (pathname.startsWith("/admin")) {
      if (userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    if (pathname.startsWith("/instructor")) {
      if (userRole !== "INSTRUCTOR") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

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
