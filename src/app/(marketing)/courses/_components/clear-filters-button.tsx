"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const ClearFiltersButton = () => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push("/courses")}
      className="bg-blue-600 text-white hover:bg-blue-700"
    >
      Clear Filters
    </Button>
  );
};
