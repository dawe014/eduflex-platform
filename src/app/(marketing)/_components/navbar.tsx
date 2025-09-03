"use client";

import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { UserButton } from "./user-button";
import { MobileNav } from "./mobile-nav";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const scrolled = useScroll(50);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg"
          : "bg-white/80 backdrop-blur-sm border-b border-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 w-full flex items-center justify-between h-full">
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 max-w-2xl">
          <MainNav />
        </div>

        {/* User Actions - Desktop */}
        <div className="hidden lg:flex items-center gap-4 ml-auto">
          <UserButton />
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center gap-3">
          <UserButton mobile />
          <MobileNav />
        </div>
      </div>
    </header>
  );
};
