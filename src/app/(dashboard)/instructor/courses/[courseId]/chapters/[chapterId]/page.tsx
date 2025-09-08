import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  LayoutDashboard,
  Video,
  BookOpen,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { ChapterTitleForm } from "./_components/chapter-title-form";
import { ChapterDescriptionForm } from "./_components/chapter-description-form";
import { ChapterAccessForm } from "./_components/chapter-access-form";
import { ChapterActions } from "./_components/chapter-actions";
import { LessonsForm } from "./_components/lessons-form";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default async function ChapterIdPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "INSTRUCTOR") {
    return redirect("/");
  }

  // ✅ Await the params
  const { courseId, chapterId } = await params;

  const chapter = await db.chapter.findUnique({
    where: {
      id: chapterId,
      courseId,
      course: {
        instructorId: session.user.id,
      },
    },
    include: {
      lessons: {
        orderBy: { position: "asc" },
      },
      course: {
        select: { title: true, enrollments: true },
      },
    },
  });

  if (!chapter) return notFound();

  const requiredFields = [chapter.title, chapter.description];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionPercentage = (completedFields / totalFields) * 100;

  const totalLessons = chapter.lessons.length;
  const publishedLessons = chapter.lessons.filter(
    (lesson) => lesson.isPublished
  ).length;

  const isReadyForPublish =
    requiredFields.every(Boolean) && publishedLessons > 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex-1">
          <Link
            href={`/instructor/courses/${courseId}`}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Course Setup
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Chapter Setup</h1>
          </div>

          <p className="text-gray-600">
            {chapter.course.title} • Chapter {chapter.position}
          </p>
        </div>

        <ChapterActions
          disabled={!isReadyForPublish}
          courseId={courseId}
          chapterId={chapterId}
          isPublished={chapter.isPublished}
        />
      </div>

      {/* Stats and Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progress Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Completion</h3>
              <Badge
                variant={
                  requiredFields.every(Boolean) ? "success" : "secondary"
                }
              >
                {requiredFields.every(Boolean) ? "Complete" : "In Progress"}
              </Badge>
            </div>
            <Progress value={completionPercentage} className="h-2 mb-2" />
            <p className="text-sm text-gray-600">
              {completedFields} of {totalFields} fields completed
            </p>
          </CardContent>
        </Card>

        {/* Lessons Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Lessons</h3>
              <div className="p-2 bg-purple-100 rounded-full">
                <Video className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalLessons}</p>
            <p className="text-sm text-gray-600">
              {publishedLessons} published
            </p>
          </CardContent>
        </Card>

        {/* Students Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Students</h3>
              <div className="p-2 bg-green-100 rounded-full">
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {chapter.course.enrollments.length}
            </p>
            <p className="text-sm text-gray-600">In this course</p>
          </CardContent>
        </Card>
      </div>

      {/* Chapter Setup Forms */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column - Chapter Details */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <IconBadge icon={LayoutDashboard} variant="primary" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Chapter Information
                </h2>
              </div>
              <div className="space-y-6">
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
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <IconBadge icon={Eye} variant="primary" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Access Settings
                </h2>
              </div>
              <ChapterAccessForm
                initialData={chapter}
                courseId={courseId}
                chapterId={chapterId}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Lessons */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <IconBadge icon={Video} variant="primary" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Lesson Management
                </h2>
              </div>
              <LessonsForm
                initialData={chapter}
                courseId={courseId}
                chapterId={chapterId}
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <IconBadge
                  icon={isReadyForPublish ? CheckCircle : AlertCircle}
                  variant={isReadyForPublish ? "success" : "warning"}
                />
                <h2 className="text-xl font-semibold text-gray-900">
                  Ready to Publish?
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                {isReadyForPublish
                  ? "Your chapter is complete and can be published."
                  : "Complete the required fields and publish at least one lesson to enable publishing."}
              </p>
              <div className="space-y-3">
                {[
                  { label: "Chapter Title", completed: !!chapter.title },
                  {
                    label: "Chapter Description",
                    completed: !!chapter.description,
                  },
                  {
                    label: "At least one published lesson",
                    completed: publishedLessons > 0,
                  },
                ].map((field, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {field.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                    <span
                      className={
                        field.completed ? "text-gray-700" : "text-gray-500"
                      }
                    >
                      {field.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
