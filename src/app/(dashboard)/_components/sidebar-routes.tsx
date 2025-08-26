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
  Home,
  GraduationCap,
  CreditCard,
  Shield,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarItem } from "./sidebar-item";
import { useSession, signOut } from "next-auth/react";

export const SidebarRoutes = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const studentRoutes = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: BookOpen,
      label: "My Learning",
      href: "/learning",
    },
    {
      icon: Heart,
      label: "Wishlist",
      href: "/wishlist",
    },
    {
      icon: GraduationCap,
      label: "My Certificates",
      href: "/certificates",
    },
  ];

  const instructorRoutes = [
    {
      icon: Video,
      label: "My Courses",
      href: "/instructor/courses",
    },
    {
      icon: BarChart,
      label: "Analytics",
      href: "/instructor/analytics",
    },
    {
      icon: CreditCard,
      label: "Earnings",
      href: "/instructor/earnings",
    },
    {
      icon: Users,
      label: "Students",
      href: "/instructor/students",
    },
  ];

  const adminRoutes = [
    {
      icon: BarChart,
      label: "Overview",
      href: "/admin/overview",
    },
    {
      icon: Users,
      label: "Users",
      href: "/admin/users",
    },
    {
      icon: Video,
      label: "Courses",
      href: "/admin/courses",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/admin/settings",
    },
    {
      icon: Shield,
      label: "Moderation",
      href: "/admin/moderation",
    },
  ];

  const commonRoutes = [
    {
      icon: User,
      label: "Profile",
      href: "/profile",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
  ];

  let routes = [...commonRoutes];

  if (session?.user?.role === "INSTRUCTOR") {
    routes = [...instructorRoutes, ...commonRoutes];
  } else if (session?.user?.role === "ADMIN") {
    routes = [...adminRoutes, ...commonRoutes];
  } else {
    routes = [...studentRoutes, ...commonRoutes];
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main navigation links */}
      <div className="flex flex-col w-full flex-1 space-y-1">
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
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          type="button"
          className="flex items-center gap-x-3 text-gray-600 text-sm font-medium p-4 transition-all hover:bg-red-50 hover:text-red-700 rounded-lg mx-2 w-full"
        >
          <LogOut size={20} className="text-gray-500" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
