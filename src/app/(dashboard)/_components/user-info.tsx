"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export const UserInfo = () => {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 border-2 border-blue-100">
        <AvatarImage src={session.user.image || ""} />
        <AvatarFallback className="bg-blue-100 text-blue-800">
          {session.user.name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {session.user.name}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Badge
            variant="outline"
            className="text-xs capitalize border-blue-200 bg-blue-50 text-blue-700"
          >
            {session.user.role?.toLowerCase() || "student"}
          </Badge>
          {session.user.role === "INSTRUCTOR" && (
            <Star className="h-3 w-3 text-amber-400 fill-current" />
          )}
        </div>
      </div>
    </div>
  );
};
