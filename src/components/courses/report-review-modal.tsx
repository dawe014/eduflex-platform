"use client";

import { reportReview } from "@/actions/review-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export const ReportReviewModal = ({ reviewId }: { reviewId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for your report.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await reportReview(reviewId, reason);
        toast.success(result.message);
        setIsOpen(false);
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-xs text-gray-500 hover:underline flex items-center gap-1">
          <Flag className="h-3 w-3" /> Report
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this review</DialogTitle>
          <DialogDescription>
            Let us know why this review is problematic. Your report is
            anonymous.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason">Reason for reporting</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Spam, offensive content, not relevant..."
          />
        </div>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Submitting..." : "Submit Report"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
