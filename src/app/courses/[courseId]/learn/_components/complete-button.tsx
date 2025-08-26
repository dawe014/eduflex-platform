"use client";

import { toggleLessonComplete } from "@/actions/progress-actions";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import { useConfettiStore } from "@/hooks/use-confetti-store"; // Fun addition!

interface CompleteButtonProps {
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
  nextLessonId?: string;
}

export const CompleteButton = ({
  courseId,
  lessonId,
  isCompleted,
  nextLessonId,
}: CompleteButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const confetti = useConfettiStore(); // Fun addition!

  const onClick = async () => {
    try {
      await toggleLessonComplete(lessonId, pathname);

      if (!isCompleted && !nextLessonId) {
        confetti.onOpen(); // Fun: confetti when completing the last lesson
      }

      if (!isCompleted && nextLessonId) {
        router.push(`/courses/${courseId}/learn/lessons/${nextLessonId}`);
      }

      toast.success("Progress updated");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const Icon = isCompleted ? XCircle : CheckCircle;

  return (
    <Button
      onClick={onClick}
      type="button"
      variant={isCompleted ? "outline" : "success"} // requires adding a success variant
      className="w-full md:w-auto"
    >
      {isCompleted ? "Mark as not complete" : "Mark as complete"}
      <Icon className="h-4 w-4 ml-2" />
    </Button>
  );
};
