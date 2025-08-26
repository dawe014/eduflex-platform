// File: src/app/(marketing)/_components/mobile-nav.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MainNav } from "./main-nav";
import { Logo } from "./logo";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-y-8">
          <Logo />
          {/* We can reuse the MainNav component, but it needs to be vertical */}
          <div className="flex flex-col gap-y-4">
            <Link
              href="/courses"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground"
            >
              Courses
            </Link>
            <Link
              href="/instructor/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground"
            >
              Teach on EduFlex
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
