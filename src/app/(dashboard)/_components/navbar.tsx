// File: src/app/(dashboard)/_components/navbar.tsx
"use client";

import { UserButton } from "@/app/(marketing)/_components/user-button";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileSidebar } from "@/hooks/use-mobile-sidebar";
import { SearchBar } from "./search-bar";
import { Bell } from "lucide-react";

export const Navbar = () => {
  const { onOpen } = useMobileSidebar();

  return (
    <div className="p-4 border-b h-full flex items-center bg-white/95 backdrop-blur-sm shadow-sm border-gray-200">
      {/* Mobile Menu Button */}
      <Button
        onClick={onOpen}
        variant="ghost"
        size="icon"
        className="md:hidden mr-4"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <SearchBar />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User Button */}
        <UserButton />
      </div>
    </div>
  );
};
