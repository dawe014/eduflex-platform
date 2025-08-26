// File: src/app/courses/[courseId]/learn/page.tsx
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

// This page is a server-side redirector.
// It finds the first available lesson and sends the user there.

export default async function CourseLearnRootPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { courseId } = await params;

  // Find the course and its first chapter with at least one published lesson
  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
        select: {
          lessons: {
            where: {
              isPublished: true,
            },
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    return notFound();
  }

  // Find the first lesson of the first chapter
  const firstLesson = course.chapters[0]?.lessons[0];

  if (!firstLesson) {
    // This could be a landing page for the course player with a message like "Coming soon!"
    return redirect(`/courses/${courseId}`);
  }

  // Redirect to the first available lesson
  return redirect(`/courses/${courseId}/learn/lessons/${firstLesson.id}`);
}
