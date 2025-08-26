// File: src/app/courses/[courseId]/learn/lessons/[lessonId]/page.tsx

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import ReactPlayer from "react-player";
import { CompleteButton } from "../../_components/complete-button";
import { Separator } from "@/components/ui/separator";

interface LessonIdPageProps {
  params: {
    courseId: string;
    lessonId: string;
  };
}

export default async function LessonIdPage({ params }: LessonIdPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect("/");
  }
  const { courseId, lessonId } = await params;

  // Security check: ensure user is enrolled (redundant but good practice)
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (!enrollment) {
    return redirect(`/courses/${courseId}`);
  }

  // Fetch the lesson and its parent chapter
  const lesson = await db.lesson.findUnique({
    where: {
      id: lessonId,
      chapter: {
        courseId: courseId,
        isPublished: true,
      },
      isPublished: true,
    },
  });

  if (!lesson) {
    return notFound();
  }

  // Fetch the user's progress for this specific lesson
  const userProgress = await db.userProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: lessonId,
      },
    },
  });

  // --- Logic to find the next lesson ---
  const courseWithLessons = await db.course.findUnique({
    where: { id: courseId },
    select: {
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        select: {
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            select: { id: true },
          },
        },
      },
    },
  });

  // Flatten the array of lessons from all chapters
  const allLessons =
    courseWithLessons?.chapters.flatMap((chapter) => chapter.lessons) || [];
  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = allLessons[currentLessonIndex + 1]; // This will be undefined if it's the last lesson

  return (
    <div className="flex flex-col max-w-4xl mx-auto pb-20">
      <div className="p-4">
        {lesson.videoUrl ? (
          <div className="aspect-video">
            <ReactPlayer
              url={lesson.videoUrl}
              width="100%"
              height="100%"
              controls
            />
          </div>
        ) : (
          <div className="aspect-video flex items-center justify-center bg-slate-200 rounded-md">
            <p className="text-muted-foreground">
              Video for this lesson is not available yet.
            </p>
          </div>
        )}
      </div>
      <div>
        <div className="p-4 flex flex-col md:flex-row items-center justify-between">
          <h2 className="text-2xl font-semibold mb-2 md:mb-0">
            {lesson.title}
          </h2>
          <CompleteButton
            courseId={courseId}
            lessonId={lessonId}
            isCompleted={!!userProgress?.isCompleted}
            nextLessonId={nextLesson?.id}
          />
        </div>
        <Separator />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">About this lesson</h3>
          {lesson.description ? (
            <p className="text-muted-foreground">{lesson.description}</p>
          ) : (
            <p className="text-muted-foreground italic">
              No description provided for this lesson.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
