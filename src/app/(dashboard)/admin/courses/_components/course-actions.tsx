"use client";

import {
  toggleCoursePublishByAdmin,
  deleteCourseByAdmin,
} from "@/actions/course-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Edit3,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const CourseActions = ({
  courseId,
  isPublished,
}: {
  courseId: string;
  isPublished: boolean;
}) => {
  const [isPending, startTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const router = useRouter();

  const onPublishToggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleCoursePublishByAdmin(courseId);
        toast.success(result.message);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    });
  };

  const onDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteCourseByAdmin(courseId);
        toast.success(result.message);
        setIsAlertOpen(false);
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={onPublishToggle}
            disabled={isPending}
            className="cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isPublished ? (
              <XCircle className="mr-2 h-4 w-4" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {isPublished ? "Unpublish" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/courses/${courseId}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              View Course
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/instructor/courses/${courseId}`}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Course
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsAlertOpen(true)}
            disabled={isPending}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Course
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              course and all of its associated content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, delete course"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
