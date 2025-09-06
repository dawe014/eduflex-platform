"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeUserProfile } from "@/actions/user-actions";
import { Button } from "@/components/ui/button";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GraduationCap, BookOpen } from "lucide-react";
import { useSession } from "next-auth/react";

export const CompleteProfileForm = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { update } = useSession();

  const handleSubmit = () => {
    if (!role) {
      toast.error("Please select a role.");
      return;
    }
    startTransition(async () => {
      try {
        await completeUserProfile(role);

        await update({ role: role });

        toast.success("Welcome to EduFlex!");
        const path =
          role === "INSTRUCTOR" ? "/instructor/courses" : "/dashboard";
        router.push(path);
        router.refresh();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setRole(UserRole.STUDENT)}
          className={cn(
            "p-6 border-2 rounded-lg text-center transition-all",
            role === UserRole.STUDENT
              ? "border-blue-600 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          )}
        >
          <BookOpen className="h-8 w-8 mx-auto text-blue-600 mb-2" />
          <span className="font-semibold">I am a Student</span>
        </button>
        <button
          onClick={() => setRole(UserRole.INSTRUCTOR)}
          className={cn(
            "p-6 border-2 rounded-lg text-center transition-all",
            role === UserRole.INSTRUCTOR
              ? "border-purple-600 bg-purple-50"
              : "border-gray-300 hover:border-purple-400"
          )}
        >
          <GraduationCap className="h-8 w-8 mx-auto text-purple-600 mb-2" />
          <span className="font-semibold">I am an Instructor</span>
        </button>
      </div>
      <Button
        onClick={handleSubmit}
        disabled={isPending || !role}
        className="w-full"
      >
        {isPending ? "Saving..." : "Complete Registration"}
      </Button>
    </div>
  );
};
