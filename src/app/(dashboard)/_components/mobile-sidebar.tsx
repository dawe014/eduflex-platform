"use client";

import { useMobileSidebar } from "@/hooks/use-mobile-sidebar";
import { Sidebar } from "./sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const MobileSidebar = () => {
  const { isOpen, onClose } = useMobileSidebar();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-72">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
