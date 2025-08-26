// File: src/app/(dashboard)/_components/sidebar-routes.tsx
"use client";

import {
  BarChart,
  BookOpen,
  Heart,
  LogOut,
  Settings,
  User,
  Users,
  Video,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarItem } from "./sidebar-item";
import { useSession, signOut } from "next-auth/react"; // Import useSession and signOut

export const SidebarRoutes = () => {
  const pathname = usePathname();
  const { data: session } = useSession(); // Get session data to check the role

  const studentRoutes = [
    {
      icon: BookOpen,
      label: "My Learning",
      href: "/dashboard",
    },
    {
      icon: Heart,
      label: "Wishlist",
      href: "/wishlist", // New page
    },
    {
      icon: User,
      label: "Profile",
      href: "/profile", // New page
    },
  ];

  const instructorRoutes = [
    {
      icon: Video,
      label: "My Courses",
      href: "/instructor/dashboard",
    },
    {
      icon: BarChart,
      label: "Earnings",
      href: "/instructor/earnings", // New page
    },
    {
      icon: User,
      label: "Profile",
      href: "/profile", // Shared page
    },
  ];

  const adminRoutes = [
    {
      icon: BarChart,
      label: "Overview",
      href: "/admin/overview", // New page
    },
    {
      icon: Users,
      label: "Manage Users",
      href: "/admin/users", // New page
    },
    {
      icon: Video,
      label: "Manage Courses",
      href: "/admin/courses", // New page
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/admin/settings", // New page
    },
  ];

  // Determine which set of routes to display
  let routes;
  if (session?.user?.role === "INSTRUCTOR") {
    routes = instructorRoutes;
  } else if (session?.user?.role === "ADMIN") {
    // We haven't added ADMIN to the schema yet, but this is how it would work
    routes = adminRoutes;
  } else {
    // Default to student routes
    routes = studentRoutes;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main navigation links */}
      <div className="flex flex-col w-full flex-1">
        {routes.map((route) => (
          <SidebarItem
            key={route.href}
            icon={route.icon}
            label={route.label}
            href={route.href}
          />
        ))}
      </div>

      {/* Logout button at the bottom */}
      <div className="mt-auto p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/" })} // Sign out and redirect to homepage
          type="button"
          className="flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-red-500 w-full"
        >
          <div className="flex items-center gap-x-2 py-4">
            <LogOut size={22} />
            Logout
          </div>
        </button>
      </div>
    </div>
  );
};
