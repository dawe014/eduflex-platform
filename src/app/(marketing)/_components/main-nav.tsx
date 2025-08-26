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
      href: `/courses`,
      label: "Courses",
      active: pathname.startsWith("/courses"),
    },
    {
      href: `/about`,
      label: "About",
      active: pathname === "/about",
    },
    {
      href: `/contact`,
      label: "Contact",
      active: pathname === "/contact",
    },
  ];

  const teachRoute = {
    href: `/instructor/dashboard`,
    label: "Teach on EduFlex",
    active: pathname.startsWith("/instructor"),
  };

  return (
    <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
      {/* Only show "Teach" link if user is an instructor OR not logged in */}
      {(session?.user?.role === "INSTRUCTOR" || !session) && (
        <Link
          key={teachRoute.href}
          href={teachRoute.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            teachRoute.active
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {teachRoute.label}
        </Link>
      )}
    </nav>
  );
};
