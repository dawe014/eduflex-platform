"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export const SearchBar = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Debounce the callback to avoid excessive database queries while the user is typing
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300); // 300ms delay

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search your courses..."
        className="pl-10"
        defaultValue={searchParams.get("search")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
};
