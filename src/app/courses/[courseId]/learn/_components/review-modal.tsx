"use client";

import { submitReview } from "@/actions/review-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Star, Award } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Review } from "@prisma/client";

interface ReviewModalProps {
  courseId: string;
  existingReview: Review | null;
}

const formSchema = z.object({
  rating: z.number().min(1, "Please select a star rating.").max(5),
  comment: z.string().optional(),
});

export const ReviewModal = ({ courseId, existingReview }: ReviewModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hover, setHover] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        const result = await submitReview(courseId, values);
        toast.success(result.message);
        setIsOpen(false);
      } catch (error) {
        toast.error((error as Error).message || "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Award className="h-4 w-4 mr-2" />
          {existingReview ? "Edit Your Review" : "Leave a Review"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How would you rate this course?</DialogTitle>
          <DialogDescription>
            Your feedback helps other students make informed decisions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="text-center">
                  <FormControl>
                    <div className="flex items-center justify-center gap-x-2">
                      {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                          <Star
                            key={starValue}
                            className={cn(
                              "h-10 w-10 cursor-pointer transition-colors",
                              starValue <= (hover || rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300"
                            )}
                            onClick={() => {
                              setRating(starValue);
                              field.onChange(starValue);
                            }}
                            onMouseEnter={() => setHover(starValue)}
                            onMouseLeave={() => setHover(0)}
                          />
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your review (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us what you liked..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
