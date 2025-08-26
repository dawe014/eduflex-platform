// File: .../_components/review-modal.tsx
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  courseId: string;
}

const formSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  comment: z.string().optional(),
});

export const ReviewModal = ({ courseId }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetch(`/api/courses/${courseId}/reviews`, {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success("Review submitted!");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Leave a Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How would you rate this course?</DialogTitle>
          <DialogDescription>
            Your feedback helps other students.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-x-2">
                      {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                          <Star
                            key={starValue}
                            className={cn(
                              "h-8 w-8 cursor-pointer",
                              starValue <= (hover || rating)
                                ? "text-yellow-400 fill-yellow-400"
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
                  <FormLabel>Your review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us what you liked or disliked"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Submit Review</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
