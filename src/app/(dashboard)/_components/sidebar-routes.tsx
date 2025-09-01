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
  CreditCard,
  Shield,
  MessageSquare,
} from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { useSession, signOut } from "next-auth/react";

export const SidebarRoutes = () => {
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
      icon: MessageSquare,
      label: "Messages",
      href: "/admin/messages",
    },
    {
      icon: Shield,
      label: "Moderation",
      href: "/admin/moderation",
    },
    {
      icon: Settings,
      label: "Platform Settings",
      href: "/admin/settings",
    },
    {
      icon: User,
      label: "Profile",
      href: "/profile",
    },
  ];

  let routes = studentRoutes; // Default to student

  if (session?.user?.role === "INSTRUCTOR") {
    routes = instructorRoutes;
  } else if (session?.user?.role === "ADMIN") {
    routes = adminRoutes;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col w-full flex-1 space-y-1 p-2">
        {routes.map((route) => (
          <SidebarItem
            key={route.href}
            icon={route.icon}
            label={route.label}
            href={route.href}
          />
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 mt-auto">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          type="button"
          className="flex items-center gap-x-3 text-gray-600 text-sm font-medium p-3 transition-all hover:bg-red-50 hover:text-red-700 rounded-lg w-full"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
