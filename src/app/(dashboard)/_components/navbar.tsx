"use client";

import { UserButton } from "@/app/(marketing)/_components/user-button";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileSidebar } from "@/hooks/use-mobile-sidebar"; // Assuming this hook exists

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

      <div className="flex items-center gap-4 ml-auto">
        <UserButton />
      </div>
    </div>
  );
};
