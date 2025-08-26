// File: src/app/(dashboard)/instructor/courses/[courseId]/lessons/[lessonId]/page.tsx
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { LessonTitleForm } from "./_components/lesson-title-form";
import { LessonVideoForm } from "./_components/lesson-video-form";
import { LessonDescriptionForm } from "./_components/lesson-description-form";
import { LessonAccessForm } from "./_components/lesson-access-form";
import { LessonActions } from "./_components/lesson-actions";

export default async function LessonIdPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const { courseId, lessonId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "INSTRUCTOR") {
    return redirect("/");
  }

  // Fetch the lesson and verify ownership through the course
  const lesson = await db.lesson.findUnique({
    where: {
      id: lessonId,
      chapter: {
        courseId: courseId,
        course: {
          instructorId: session.user.id,
        },
      },
    },
  });

  if (!lesson) {
    return notFound();
  }

  const requiredFields = [lesson.title, lesson.description, lesson.videoUrl];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const isComplete = requiredFields.every(Boolean);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <Link
            href={`/instructor/courses/${courseId}`}
            className="flex items-center text-sm hover:opacity-75 transition mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to course setup
          </Link>
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-y-2">
              <h1 className="text-2xl font-medium">Lesson Setup</h1>
              <span className="text-sm text-slate-700">
                Complete all fields ({completedFields}/{totalFields})
              </span>
            </div>
            <LessonActions
              disabled={!isComplete}
              courseId={courseId}
              lessonId={lessonId}
              isPublished={lesson.isPublished}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize your lesson</h2>
            </div>
            <LessonTitleForm
              initialData={lesson}
              courseId={courseId}
              lessonId={lessonId}
            />
            <LessonDescriptionForm
              initialData={lesson}
              courseId={courseId}
              lessonId={lessonId}
            />
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Eye} />
              <h2 className="text-xl">Access Settings</h2>
            </div>
            <LessonAccessForm
              initialData={lesson}
              courseId={courseId}
              lessonId={lessonId}
            />
          </div>
        </div>
        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-xl">Add a video</h2>
            </div>
            <LessonVideoForm
              initialData={lesson}
              courseId={courseId}
              lessonId={lessonId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
