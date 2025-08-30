// File: src/app/(marketing)/_components/user-button.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
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
import { Settings, LogOut, User, BookOpen, Video, Crown } from "lucide-react";

export function UserButton() {
  const { data: session, status } = useSession();

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
        <Button size="sm" asChild>
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-10 w-10 border-2 border-blue-100 cursor-pointer hover:border-blue-200 transition-colors">
          <AvatarImage src={session?.user?.image || ""} />
          <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-semibold">{session?.user?.name}</span>
          <span className="text-xs text-gray-500 font-normal capitalize">
            {session?.user?.role?.toLowerCase() || "student"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href={
              session?.user?.role === "INSTRUCTOR"
                ? "/instructor/courses"
                : "/dashboard"
            }
            className="cursor-pointer"
          >
            {session?.user?.role === "INSTRUCTOR" ? (
              <Video className="h-4 w-4 mr-2" />
            ) : (
              <BookOpen className="h-4 w-4 mr-2" />
            )}
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Settings
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
