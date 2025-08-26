// File: src/components/courses/enroll-button.tsx
"use client";

import { createCheckoutSession } from "@/actions/checkout-actions";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner"; // We will add this library

interface EnrollButtonProps {
  courseId: string;
}

export const EnrollButton = ({ courseId }: EnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();

  const handleEnroll = async () => {
    if (status === "unauthenticated") {
      toast.error("You must be logged in to enroll.");
      return;
    }

    setIsLoading(true);
    try {
      const { url } = await createCheckoutSession(courseId);
      window.location.href = url;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full"
      onClick={handleEnroll}
      disabled={isLoading || status === "loading"}
    >
      {isLoading ? "Processing..." : "Enroll Now"}
    </Button>
  );
};
