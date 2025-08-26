// File: middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // Redirect if user is not an instructor
    if (
      req.nextUrl.pathname.startsWith("/instructor") &&
      req.nextauth.token?.role !== "INSTRUCTOR"
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/instructor/:path*", "/dashboard"],
};
