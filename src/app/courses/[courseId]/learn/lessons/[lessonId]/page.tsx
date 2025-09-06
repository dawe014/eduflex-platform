import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import ReactPlayer from "react-player";
import { CompleteButton } from "../../_components/complete-button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LessonIdPageProps {
  params: {
    courseId: string;
    lessonId: string;
  };
}

export default async function LessonIdPage({ params }: LessonIdPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");

  const { courseId, lessonId } = await params;

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    include: {
      course: {
        select: {
          title: true,
          instructor: { select: { name: true } },
        },
      },
    },
  });
  if (!enrollment) return redirect(`/courses/${courseId}`);

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
    include: {
      chapter: {
        select: { title: true, position: true },
      },
    },
  });
  if (!lesson) return notFound();

  // Fetch the user's progress for this specific lesson
  const userProgress = await db.userProgress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
  });

  // --- Logic to find the next and previous lessons ---
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
            select: { id: true, title: true, position: true },
          },
        },
      },
    },
  });

  const allLessons =
    courseWithLessons?.chapters.flatMap((chapter) => chapter.lessons) || [];
  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = allLessons[currentLessonIndex + 1];
  const previousLesson = allLessons[currentLessonIndex - 1];

  return (
    <div className="flex flex-col max-w-6xl mx-auto pb-20 lg:pb-0">
      {/* Breadcrumb Navigation */}
      <div className="p-6 pb-4">
        <nav className="flex items-center text-sm text-gray-600 mb-6 flex-wrap">
          <Link href="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1.5 flex-shrink-0" />
          <Link href="/learning" className="hover:text-blue-600">
            My Learning
          </Link>
          <ChevronRight className="h-4 w-4 mx-1.5 flex-shrink-0" />
          <Link
            href={`/courses/${courseId}`}
            className="hover:text-blue-600 line-clamp-1 max-w-[200px] sm:max-w-xs"
          >
            {enrollment.course.title}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1.5 flex-shrink-0" />
          <span className="text-gray-900 font-medium line-clamp-1">
            {lesson.title}
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-6">
          <div>
            <Badge
              variant="outline"
              className="mb-2 bg-blue-50 text-blue-700 border-blue-200"
            >
              Chapter {lesson.chapter.position}: {lesson.chapter.title}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              {lesson.title}
            </h1>
            <p className="text-gray-600 mt-2">
              from {enrollment.course.instructor.name}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {lesson.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{lesson.duration}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>Lesson {lesson.position}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="px-6 mb-8">
        {lesson.videoUrl ? (
          <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            <ReactPlayer
              src={lesson.videoUrl}
              width="100%"
              height="100%"
              controls
              playing={false}
              light={false}
            />
          </div>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-lg">
            <Play className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Video Coming Soon
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              The video for this lesson is being prepared and will be available
              shortly.
            </p>
          </div>
        )}
      </div>

      {/* Lesson Content */}
      <div className="px-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  About this lesson
                </h2>
                {lesson.description ? (
                  <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
                    <p>{lesson.description.replace(/\n/g, "<br />")}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No detailed description available for this lesson.
                  </p>
                )}
              </div>
              <div className="w-full md:w-auto md:text-right flex-shrink-0">
                <CompleteButton
                  courseId={courseId}
                  lessonId={lessonId}
                  isCompleted={!!userProgress?.isCompleted}
                  nextLessonId={nextLesson?.id}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Mark as complete to track your progress
                </p>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Lesson Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {previousLesson ? (
                <Button
                  variant="outline"
                  className="h-auto flex items-center gap-2 p-4 border-gray-300 text-gray-700 hover:bg-gray-50 justify-start flex-1"
                  asChild
                >
                  <Link
                    href={`/courses/${courseId}/learn/lessons/${previousLesson.id}`}
                  >
                    <ChevronLeft className="h-5 w-5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-xs text-gray-500">Previous</div>
                      <div className="font-medium line-clamp-1 text-sm">
                        {previousLesson.title}
                      </div>
                    </div>
                  </Link>
                </Button>
              ) : (
                <div className="flex-1" />
              )}

              {nextLesson ? (
                <Button
                  className="h-auto flex items-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 justify-end flex-1"
                  asChild
                >
                  <Link
                    href={`/courses/${courseId}/learn/lessons/${nextLesson.id}`}
                  >
                    <div className="text-right">
                      <div className="text-sm text-blue-100">Next Lesson</div>
                      <div className="font-medium line-clamp-1 text-sm text-white">
                        {nextLesson.title}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 flex-shrink-0" />
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="h-auto flex items-center gap-2 p-4 border-green-300 text-green-700 hover:bg-green-50 justify-end flex-1"
                  asChild
                >
                  <Link href={`/courses/${courseId}`}>
                    <div className="text-right">
                      <div className="text-sm">Finish Course</div>
                      <div className="font-medium line-clamp-1 text-sm">
                        Back to Course Page
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 p-2 z-40 lg:hidden">
        <div className="flex justify-between items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-gray-600"
            asChild={!!previousLesson}
            disabled={!previousLesson}
          >
            {previousLesson ? (
              <Link
                href={`/courses/${courseId}/learn/lessons/${previousLesson.id}`}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </Link>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </>
            )}
          </Button>
          <CompleteButton
            courseId={courseId}
            lessonId={lessonId}
            isCompleted={!!userProgress?.isCompleted}
            nextLessonId={nextLesson?.id}
            variant="sm"
          />
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-blue-600"
            asChild={!!nextLesson}
            disabled={!nextLesson}
          >
            {nextLesson ? (
              <Link
                href={`/courses/${courseId}/learn/lessons/${nextLesson.id}`}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
