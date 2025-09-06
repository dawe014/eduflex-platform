"use client";

import { Button } from "@/components/ui/button";
import { Trash, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface CourseActionsProps {
  disabled: boolean;
  courseId: string;
  isPublished: boolean;
}

export const CourseActions = ({
  disabled,
  courseId,
  isPublished,
}: CourseActionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onPublishToggle = async () => {
    try {
      setIsLoading(true);
      const url = `/api/courses/${courseId}/${
        isPublished ? "unpublish" : "publish"
      }`;
      await fetch(url, { method: "PATCH" });
      toast.success(`Course ${isPublished ? "unpublished" : "published"}`);
      router.refresh();
    } catch {
      toast.error("Failed to update course status");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      toast.success("Course deleted successfully");
      router.refresh();
      router.push("/instructor/courses");
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Badge
        variant={isPublished ? "default" : "secondary"}
        className="px-3 py-1"
      >
        {isPublished ? "Published" : "Draft"}
      </Badge>

      <Button
        onClick={onPublishToggle}
        disabled={disabled || isLoading}
        variant={isPublished ? "outline" : "default"}
        size="sm"
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPublished ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        {isPublished ? "Unpublish" : "Publish"}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="destructive"
            disabled={isLoading}
            className="gap-2"
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be
              undone and will permanently remove all course content, chapters,
              and lessons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
