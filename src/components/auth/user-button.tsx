"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export function UserButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />;
  }

  if (status === "unauthenticated") {
    return <Button onClick={() => signIn()}>Sign In</Button>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={session?.user?.image || ""} />
          <AvatarFallback>
            {session?.user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link
            href={
              session?.user?.role === "INSTRUCTOR"
                ? "/instructor/dashboard"
                : session?.user?.role === "ADMIN"
                ? "/admin/overview"
                : "/dashboard"
            }
          >
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
