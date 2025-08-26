"use client";

import { toggleWishlist } from "@/actions/wishlist-actions";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  courseId: string;
  isWishlisted: boolean;
}

export const WishlistButton = ({
  courseId,
  isWishlisted,
}: WishlistButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleWishlist(courseId, pathname);
        toast.success(
          isWishlisted ? "Removed from wishlist" : "Added to wishlist"
        );
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      variant="outline"
      size="icon"
      className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
    >
      <Heart
        className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")}
      />
    </Button>
  );
};
