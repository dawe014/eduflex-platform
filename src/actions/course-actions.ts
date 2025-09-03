"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPlatformSettings } from "./settings-actions";

/**
 * Action for an INSTRUCTOR to create a new course.
 * It redirects directly to the new course's setup page.
 */
export async function createCourse(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "INSTRUCTOR") {
    throw new Error("Unauthorized: Only instructors can create courses.");
  }

  const settings = await getPlatformSettings();
  if (!settings.allowCourseSubmissions) {
    throw new Error(
      "New course submissions are currently disabled by the administrator."
    );
  }

  const instructorId = session.user.id;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;

  if (!title || title.trim().length < 3) {
    throw new Error(
      "Title is required and must be at least 3 characters long."
    );
  }

  let course;
  try {
    course = await db.course.create({
      data: {
        title,
        description: description || undefined,
        instructorId: instructorId,
      },
    });
  } catch (error) {
    console.error("COURSE_CREATION_ERROR", error);
    throw new Error("Failed to create the course. Please try again.");
  }

  revalidatePath("/instructor/courses");
  redirect(`/instructor/courses/${course.id}`);
}

/**
 * Action for an ADMIN to toggle the publication status of any course.
 */
export async function toggleCoursePublishByAdmin(courseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Admins only.");
  }

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new Error("Course not found.");
  }

  const updatedCourse = await db.course.update({
    where: { id: courseId },
    data: { isPublished: !course.isPublished },
  });

  revalidatePath("/admin/courses");
  return {
    success: true,
    message: `Course has been ${
      updatedCourse.isPublished ? "published" : "unpublished"
    }.`,
  };
}

/**
 * Action for an ADMIN to delete any course.
 */
export async function deleteCourseByAdmin(courseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Admins only.");
  }

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new Error("Course not found.");
  }

  const deletedCourse = await db.course.delete({
    where: { id: courseId },
  });

  revalidatePath("/admin/courses");
  return {
    success: true,
    message: `Course "${deletedCourse.title}" has been deleted.`,
  };
}
