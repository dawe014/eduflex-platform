// File: src/app/(marketing)/_components/mobile-nav.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  X,
  BookOpen,
  GraduationCap,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "./logo";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const routes = [
    {
      href: "/courses",
      label: "Browse Courses",
      icon: BookOpen,
      active: pathname.startsWith("/courses"),
    },
    {
      href: "/about",
      label: "About Us",
      icon: GraduationCap,
      active: pathname === "/about",
    },
    {
      href: "/contact",
      label: "Contact",
      icon: User,
      active: pathname === "/contact",
    },
  ];

  const teachRoute = {
    href: "/instructor/dashboard",
    label: "Teach on EduFlex",
    icon: GraduationCap,
    active: pathname.startsWith("/instructor"),
  };

  const userRoutes = session
    ? [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: Settings,
          active: pathname === "/dashboard",
        },
        {
          href: "/learning",
          label: "My Learning",
          icon: BookOpen,
          active: pathname.startsWith("/learning"),
        },
      ]
    : [];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Logo />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-9 w-9"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
              {/* Main Navigation */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Navigation
                </h3>
                <div className="space-y-2">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        route.active
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <route.icon className="h-4 w-4" />
                      {route.label}
                    </Link>
                  ))}

                  {/* Teach Route */}
                  {(session?.user?.role === "INSTRUCTOR" || !session) && (
                    <Link
                      href={teachRoute.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        teachRoute.active
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <teachRoute.icon className="h-4 w-4" />
                      {teachRoute.label}
                    </Link>
                  )}
                </div>
              </div>

              {/* User Routes */}
              {userRoutes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    My Account
                  </h3>
                  <div className="space-y-2">
                    {userRoutes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          route.active
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <route.icon className="h-4 w-4" />
                        {route.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Auth Status */}
              {!session && (
                <div className="space-y-3 pt-4">
                  <Button
                    asChild
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>

          {/* Footer */}
          {session && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {session.user.name}
                  </p>
                  <p className="truncate">{session.user.email}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
