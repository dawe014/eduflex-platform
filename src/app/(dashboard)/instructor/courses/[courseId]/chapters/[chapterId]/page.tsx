import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { ChapterTitleForm } from "./_components/chapter-title-form";
import { ChapterDescriptionForm } from "./_components/chapter-description-form";
import { ChapterAccessForm } from "./_components/chapter-access-form";
import { ChapterActions } from "./_components/chapter-actions";
import { LessonsForm } from "./_components/lessons-form"; // We will create this

export default async function ChapterIdPage({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "INSTRUCTOR") {
    return redirect("/");
  }
  const { courseId, chapterId } = await params;

  const chapter = await db.chapter.findUnique({
    where: {
      id: chapterId,
      courseId: courseId,
    },
    include: {
      lessons: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!chapter) {
    return notFound();
  }

  const requiredFields = [chapter.title, chapter.description];
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
            Back to Course Setup
          </Link>
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-y-2">
              <h1 className="text-2xl font-medium">Chapter Setup</h1>
              <span className="text-sm text-slate-700">
                Complete all fields ({completedFields}/{totalFields})
              </span>
            </div>
            <ChapterActions
              disabled={!isComplete}
              courseId={courseId}
              chapterId={chapterId}
              isPublished={chapter.isPublished}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        {/* Left Column: Chapter Details */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize your chapter</h2>
            </div>
            <ChapterTitleForm
              initialData={chapter}
              courseId={courseId}
              chapterId={chapterId}
            />
            <ChapterDescriptionForm
              initialData={chapter}
              courseId={courseId}
              chapterId={chapterId}
            />
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Eye} />
              <h2 className="text-xl">Access Settings</h2>
            </div>
            <ChapterAccessForm
              initialData={chapter}
              courseId={courseId}
              chapterId={chapterId}
            />
          </div>
        </div>
        {/* Right Column: Lesson Management */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-xl">Add lessons to this chapter</h2>
            </div>
            <LessonsForm
              initialData={chapter}
              courseId={courseId}
              chapterId={chapterId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
