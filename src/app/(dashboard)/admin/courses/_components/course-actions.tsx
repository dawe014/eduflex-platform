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
} from "lucide-react";
import Link from "next/link";
import { useTransition, useState } from "react";
import { toast } from "sonner";

export const CourseActions = ({
  courseId,
  isPublished,
}: {
  courseId: string;
  isPublished: boolean;
}) => {
  const [isPending, startTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const onPublishToggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleCoursePublishByAdmin(courseId);
        toast.success(result.message);
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  const onDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteCourseByAdmin(courseId);
        toast.success(result.message);
        setIsAlertOpen(false);
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onPublishToggle} disabled={isPending}>
            {isPublished ? (
              <XCircle className="mr-2 h-4 w-4" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {isPublished ? "Unpublish" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/courses/${courseId}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              View Course
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/instructor/courses/${courseId}`}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit as Instructor
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsAlertOpen(true)}
            disabled={isPending}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Course
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course and all its content
              (chapters, lessons, enrollments, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? "Deleting..." : "Yes, delete course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
