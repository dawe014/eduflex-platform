"use client";

import { updateUserRole, deleteUser } from "@/actions/user-actions";
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
import { UserRole } from "@prisma/client";
import {
  MoreHorizontal,
  User,
  GraduationCap,
  Shield,
  Trash2,
} from "lucide-react";
import { useTransition, useState } from "react";
import { toast } from "sonner";

export const UserActions = ({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) => {
  const [isPending, startTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const onRoleChange = (role: UserRole) => {
    if (role === currentRole) return;
    startTransition(async () => {
      try {
        await updateUserRole(userId, role);
        toast.success("User role updated successfully.");
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
        const result = await deleteUser(userId);
        toast.success(result.message);
        setIsAlertOpen(false);
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
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onRoleChange(UserRole.STUDENT)}
            disabled={isPending || currentRole === UserRole.STUDENT}
          >
            <User className="mr-2 h-4 w-4" />
            Make Student
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onRoleChange(UserRole.INSTRUCTOR)}
            disabled={isPending || currentRole === UserRole.INSTRUCTOR}
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Make Instructor
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onRoleChange(UserRole.ADMIN)}
            disabled={isPending || currentRole === UserRole.ADMIN}
          >
            <Shield className="mr-2 h-4 w-4" />
            Make Admin
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setIsAlertOpen(true)}
            disabled={isPending}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog for Deletion */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user and all of their associated data (enrollments, progress,
              reviews, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? "Deleting..." : "Yes, delete user"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
