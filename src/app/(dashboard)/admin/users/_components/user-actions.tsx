"use client";
import { updateUserRole } from "@/actions/user-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@prisma/client";
import { MoreHorizontal } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export const UserActions = ({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) => {
  const [isPending, startTransition] = useTransition();

  const onRoleChange = (role: UserRole) => {
    if (role === currentRole) return;
    startTransition(async () => {
      try {
        await updateUserRole(userId, role);
        toast.success("User role updated successfully.");
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onRoleChange("STUDENT")}
          disabled={isPending}
        >
          Make Student
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onRoleChange("INSTRUCTOR")}
          disabled={isPending}
        >
          Make Instructor
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onRoleChange("ADMIN")}
          disabled={isPending}
        >
          Make Admin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
