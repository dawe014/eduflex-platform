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
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { LessonTitleForm } from "./_components/lesson-title-form";
import { LessonVideoForm } from "./_components/lesson-video-form";
import { LessonDescriptionForm } from "./_components/lesson-description-form";
import { LessonAccessForm } from "./_components/lesson-access-form";
import { LessonActions } from "./_components/lesson-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LessonDurationForm } from "./_components/lesson-duration-form";

export default async function LessonIdPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "INSTRUCTOR") {
    return redirect("/");
  }

  // CORRECT: Destructure params directly
  const { courseId, lessonId } = await params;

  const lesson = await db.lesson.findUnique({
    where: {
      id: lessonId,
      chapter: {
        courseId: courseId,
        course: {
          instructorId: session.user.id, // Security: Verify ownership
        },
      },
    },
    include: {
      chapter: {
        select: {
          id: true, // Fetch the chapterId
          title: true,
          position: true,
          course: {
            select: {
              title: true,
              enrollments: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return notFound();
  }

  // The chapterId is now available from the fetched lesson data
  const chapterId = lesson.chapter.id;

  const requiredFields = [
    lesson.title,
    lesson.description,
    lesson.videoUrl,
    lesson.duration,
  ];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionPercentage = (completedFields / totalFields) * 100;
  const isComplete = requiredFields.every(Boolean);

  // Placeholder for duration
  const formattedDuration = lesson.duration ? lesson.duration : "Not set";

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link
              href={`/instructor/courses/${courseId}`}
              className="hover:text-gray-900 transition-colors flex items-center group"
            >
              <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Course
            </Link>
            <span className="mx-2">•</span>
            <Link
              href={`/instructor/courses/${courseId}/chapters/${chapterId}`}
              className="hover:text-gray-900 transition-colors"
            >
              Chapter {lesson.chapter.position}
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Video className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Lesson Setup</h1>
          </div>

          <p className="text-gray-600">
            {lesson.chapter.course.title} • {lesson.chapter.title}
          </p>
        </div>

        <LessonActions
          disabled={!isComplete}
          courseId={courseId}
          chapterId={chapterId} // Pass the fetched chapterId
          lessonId={lessonId}
          isPublished={lesson.isPublished}
        />
      </div>

      {/* Stats and Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progress Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Completion</h3>
              <Badge variant={isComplete ? "success" : "secondary"}>
                {isComplete ? "Complete" : "In Progress"}
              </Badge>
            </div>
            <Progress value={completionPercentage} className="h-2 mb-2" />
            <p className="text-sm text-gray-600">
              {completedFields} of {totalFields} fields completed
            </p>
          </CardContent>
        </Card>

        {/* Duration Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Duration</h3>
              <div className="p-2 bg-amber-100 rounded-full">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formattedDuration}
            </p>
            <p className="text-sm text-gray-600">Video length</p>
          </CardContent>
        </Card>

        {/* Position Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Position</h3>
              <div className="p-2 bg-purple-100 rounded-full">
                <BookOpen className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {lesson.position}
            </p>
            <p className="text-sm text-gray-600">In chapter</p>
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
              {lesson.chapter.course.enrollments.length}
            </p>
            <p className="text-sm text-gray-600">Total in course</p>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Setup Forms */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column - Lesson Details */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <IconBadge icon={LayoutDashboard} variant="primary" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Lesson Information
                </h2>
              </div>
              <div className="space-y-6">
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
                <LessonDurationForm
                  initialData={lesson}
                  courseId={courseId}
                  lessonId={lessonId}
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
              <LessonAccessForm
                initialData={lesson}
                courseId={courseId}
                lessonId={lessonId}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Video */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <IconBadge icon={Video} variant="primary" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Video Content
                </h2>
              </div>
              <LessonVideoForm
                initialData={lesson}
                courseId={courseId}
                lessonId={lessonId}
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <IconBadge
                  icon={isComplete ? CheckCircle : AlertCircle}
                  variant={isComplete ? "success" : "warning"}
                />
                <h2 className="text-xl font-semibold text-gray-900">
                  Ready to Publish?
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                {isComplete
                  ? "Your lesson is complete and ready to be published."
                  : "Complete all required fields to publish this lesson."}
              </p>
              <div className="space-y-3">
                {[
                  { label: "Lesson Title", completed: !!lesson.title },
                  {
                    label: "Lesson Description",
                    completed: !!lesson.description,
                  },
                  { label: "Video Uploaded", completed: !!lesson.videoUrl },
                  { label: "Lesson Duration", completed: !!lesson.duration },
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
