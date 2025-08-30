"use client";

import { approveReview, deleteReviewByAdmin } from "@/actions/review-actions";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export const ModerationActions = ({ reviewId }: { reviewId: string }) => {
  const [isPending, startTransition] = useTransition();

  const onApprove = () => {
    startTransition(async () => {
      try {
        const result = await approveReview(reviewId);
        toast.success(result.message);
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  const onDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteReviewByAdmin(reviewId);
        toast.success(result.message);
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onApprove}
        disabled={isPending}
        size="sm"
        variant="outline"
        className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
      >
        <Check className="h-4 w-4 mr-2" />
        Approve
      </Button>
      <Button
        onClick={onDelete}
        disabled={isPending}
        size="sm"
        variant="destructive"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </div>
  );
};
