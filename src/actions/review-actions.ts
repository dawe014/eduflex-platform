"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  comment: z.string().optional(),
});

/**
 * Action for a student to create or update their review for a course.
 */
export async function submitReview(
  courseId: string,
  formData: {
    rating: number;
    comment?: string;
  }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("You must be logged in to leave a review.");
  }

  // 1. Validate the input data from the form
  const validation = reviewSchema.safeParse(formData);
  if (!validation.success) {
    throw new Error("Invalid review data.");
  }
  const { rating, comment } = validation.data;

  // 2. Security Check: Verify the user is enrolled in the course
  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId },
    },
  });
  if (!enrollment) {
    throw new Error("You must be enrolled in this course to leave a review.");
  }

  // 3. Create or Update the review using `upsert`
  // `upsert` is perfect here: it will create a new review if one doesn't exist,
  // or update the existing one if the user wants to change their rating/comment.
  await db.review.upsert({
    where: {
      userId_courseId: { userId: session.user.id, courseId },
    },
    update: {
      // What to do if a review already exists
      rating,
      comment,
    },
    create: {
      // What to do if no review exists
      courseId,
      userId: session.user.id,
      rating,
      comment,
    },
  });

  // Revalidate the course page path to show the new review instantly
  revalidatePath(`/courses/${courseId}`);

  return { success: true, message: "Thank you for your review!" };
}
