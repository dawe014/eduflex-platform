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

interface ChapterActionsProps {
  disabled: boolean;
  courseId: string;
  chapterId: string;
  isPublished: boolean;
}

export const ChapterActions = ({
  disabled,
  courseId,
  chapterId,
  isPublished,
}: ChapterActionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onPublishToggle = async () => {
    try {
      setIsLoading(true);
      const url = `/api/courses/${courseId}/chapters/${chapterId}/${
        isPublished ? "unpublish" : "publish"
      }`;
      await fetch(url, { method: "PATCH" });
      toast.success(`Chapter ${isPublished ? "unpublished" : "published"}`);
      router.refresh();
    } catch {
      toast.error("Failed to update chapter status");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        method: "DELETE",
      });
      toast.success("Chapter deleted successfully");
      router.refresh();
      router.push(`/instructor/courses/${courseId}`);
    } catch {
      toast.error("Failed to delete chapter");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Badge
        variant={isPublished ? "success" : "secondary"}
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
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chapter? This will also
              delete all lessons within this chapter. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
              Delete Chapter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
