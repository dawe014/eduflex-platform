"use client";

import { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const SidebarItem = ({ icon: Icon, label, href }: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive =
    (pathname === "/" && href === "/") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  const onClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "flex items-center gap-x-3 text-gray-600 text-sm font-medium p-4 transition-all hover:bg-blue-50 hover:text-blue-700 rounded-lg mx-2",
        isActive && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
      )}
    >
      <Icon
        size={20}
        className={cn("text-gray-500", isActive && "text-blue-600")}
      />
      <span className="flex-1 text-left">{label}</span>

      {isActive && (
        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full ml-auto" />
      )}
    </button>
  );
};
