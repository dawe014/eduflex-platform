// File: src/actions/checkout-actions.ts
"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";

export async function createCheckoutSession(courseId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to enroll.");
  }

  const userId = session.user.id;

  const course = await db.course.findUnique({
    where: { id: courseId, isPublished: true },
  });

  if (!course) {
    throw new Error("Course not found.");
  }

  if (course.price === null) {
    throw new Error("This course is free and cannot be purchased.");
  }

  // Check if user is already enrolled
  const existingEnrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingEnrollment) {
    throw new Error("You are already enrolled in this course.");
  }

  // --- THE FIX IS HERE ---
  // Await the headers() function before using it
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";
  // --- END OF FIX ---

  // Create a Stripe Checkout Session
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            description: course.description || "",
          },
          unit_amount: Math.round(course.price * 100), // Price in cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/courses/${course.id}?success=1`,
    cancel_url: `${origin}/courses/${course.id}?canceled=1`,
    // IMPORTANT: Add metadata to link the session to our user and course
    metadata: {
      courseId: course.id,
      userId: userId,
    },
  });

  if (!stripeSession.url) {
    throw new Error("Could not create Stripe session.");
  }

  return { url: stripeSession.url };
}
