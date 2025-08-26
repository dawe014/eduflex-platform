// File: src/app/(dashboard)/_components/search-bar.tsx
"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SearchBar = () => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search courses, lessons..."
        className="pl-10 bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};
