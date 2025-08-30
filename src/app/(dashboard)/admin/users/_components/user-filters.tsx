"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { UserRole } from "@prisma/client";

export const UserFilters = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users by name or email..."
          className="pl-10"
          defaultValue={searchParams.get("search")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <Select
        onValueChange={(value) => handleFilter("role", value)}
        defaultValue={searchParams.get("role") || "all"}
      >
        <SelectTrigger className="w-full lg:w-40">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value={UserRole.STUDENT}>Students</SelectItem>
          <SelectItem value={UserRole.INSTRUCTOR}>Instructors</SelectItem>
          <SelectItem value={UserRole.ADMIN}>Admins</SelectItem>
        </SelectContent>
      </Select>
      <Select
        onValueChange={(value) => handleFilter("sort", value)}
        defaultValue={searchParams.get("sort") || "newest"}
      >
        <SelectTrigger className="w-full lg:w-40">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
