"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const MainNav = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/courses",
      label: "Courses",
      active: pathname.startsWith("/courses"),
    },
    {
      href: "/about",
      label: "About",
      active: pathname === "/about",
    },
    {
      href: "/contact",
      label: "Contact",
      active: pathname === "/contact",
    },
  ];

  const teachRoute = {
    href: "/instructor/courses",
    label: "Teach",
    active: pathname.startsWith("/instructor"),
  };

  return (
    <nav className="flex items-center space-x-1">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-blue-600",
            route.active
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:bg-gray-50"
          )}
        >
          {route.label}
        </Link>
      ))}

      {session?.user?.role === "INSTRUCTOR" && (
        <Link
          key={teachRoute.href}
          href={teachRoute.href}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium transition-colors",
            teachRoute.active
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
          )}
        >
          {teachRoute.label}
        </Link>
      )}
    </nav>
  );
};
