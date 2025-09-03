"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { LogOut, User, BookOpen, Video, Crown, BarChart } from "lucide-react";
import { UserRole } from "@prisma/client";

export function UserButton() {
  const { data: session, status } = useSession();

  const getDashboardPath = (role: UserRole | undefined) => {
    switch (role) {
      case "ADMIN":
        return "/admin/overview";
      case "INSTRUCTOR":
        return "/instructor/courses";
      case "STUDENT":
        return "/dashboard";
      default:
        return "/"; // Fallback for any unexpected cases
    }
  };

  if (status === "loading") {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center gap-2 ml-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    );
  }

  const dashboardPath = getDashboardPath(session?.user?.role);
  const userRole = session?.user?.role;

  // Choose the icon based on the role for the dashboard link
  const DashboardIcon =
    userRole === "ADMIN"
      ? BarChart
      : userRole === "INSTRUCTOR"
      ? Video
      : BookOpen;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-10 w-10 border-2 border-transparent hover:border-blue-300 transition-colors">
          <AvatarImage src={session?.user?.image || ""} />
          <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 font-semibold">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-semibold truncate">{session?.user?.name}</span>
          <span className="text-xs text-gray-500 font-normal capitalize flex items-center gap-1 mt-1">
            {userRole === "ADMIN" && (
              <Crown className="h-3 w-3 text-amber-500" />
            )}
            {session?.user?.role?.toLowerCase() || "student"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={dashboardPath} className="cursor-pointer">
            <DashboardIcon className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
