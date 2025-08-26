// File: src/actions/course-actions.ts
"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCourse(formData: FormData) {
  // 1. Get the current user's session
  const session = await getServerSession(authOptions);

  // 2. Check for authentication and role
  if (!session?.user?.id || session.user.role !== "INSTRUCTOR") {
    throw new Error("Unauthorized");
  }

  const instructorId = session.user.id;
  const title = formData.get("title") as string;

  // 3. Validate the input
  if (!title) {
    throw new Error("Title is required");
  }

  // 4. Create the course in the database
  const course = await db.course.create({
    data: {
      title,
      instructorId: instructorId,
    },
  });

  console.log("Created course:", course);

  // 5. Revalidate and Redirect (placeholder for now)
  // Later, we will redirect to the course edit page
  // For now, let's redirect to the dashboard
  revalidatePath("/instructor/dashboard");
  redirect(`/instructor/dashboard`);
}
