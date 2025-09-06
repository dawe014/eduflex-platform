"use client";

import { toggleWishlist } from "@/actions/wishlist-actions";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface WishlistButtonProps {
  courseId: string;
  isWishlisted: boolean;
}

export const WishlistButton = ({
  courseId,
  isWishlisted,
}: WishlistButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleToggle = () => {
    if (!session) {
      toast.error("Please sign in to add courses to your wishlist.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await toggleWishlist(courseId, pathname);
        toast.success(result.message);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unknown error occurred.");
        }
      }
    });
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      variant="secondary"
      size="icon"
      className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
    >
      <Heart
        className={cn(
          "h-4 w-4 text-gray-600",
          isWishlisted && "fill-red-500 text-red-500"
        )}
      />
    </Button>
  );
};
