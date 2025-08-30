"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export const SearchInput = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Debounce the callback to avoid sending too many requests while typing
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Reset to first page on new search
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300); // 300ms delay

  return (
    <Input
      placeholder="Search by name or email..."
      className="pl-10"
      defaultValue={searchParams.get("search")?.toString()}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
};
