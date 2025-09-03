import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;
    const userRole = token?.role as UserRole;

    console.log("role:", userRole, "path:", pathname);
    if (userRole === "NEW_USER" && pathname !== "/register/complete-profile") {
      return NextResponse.redirect(
        new URL("/register/complete-profile", req.url)
      );
    }

    if (userRole !== "NEW_USER" && pathname === "/register/complete-profile") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

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

  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },

    pages: {
      signIn: "/login",
    },
  }
);

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

    "/courses/:courseId/learn/:path*",
  ],
};
