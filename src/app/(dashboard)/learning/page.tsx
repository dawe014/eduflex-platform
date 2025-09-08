import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BookOpen, TrendingUp, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EnrolledCourseCard } from "@/components/courses/enrolled-course-card";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "./_components/search-bar";

export default async function MyLearningPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect("/");
  }

  const searchTerm = search || "";

  const enrollments = await db.enrollment.findMany({
    where: {
      userId: session.user.id,
      course: {
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          chapters: {
            where: { isPublished: true },
            include: {
              lessons: {
                where: { isPublished: true },
                include: {
                  progress: {
                    where: { userId: session.user.id, isCompleted: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate progress for each (filtered) course
  const coursesWithProgress = enrollments.map(({ course }) => {
    const totalLessons = course.chapters.reduce(
      (acc, chapter) => acc + chapter.lessons.length,
      0
    );
    const completedLessons = course.chapters.reduce(
      (acc, chapter) =>
        acc + chapter.lessons.filter((l) => l.progress.length > 0).length,
      0
    );
    const progress =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
    return { course, progress, completedLessons, totalLessons };
  });

  // Calculate overall stats based on ALL of the user's courses, not just the filtered ones
  const allUserEnrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          chapters: {
            include: {
              lessons: {
                include: {
                  progress: {
                    where: { userId: session.user.id, isCompleted: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  let totalLessons = 0;
  let completedLessons = 0;
  allUserEnrollments.forEach(({ course }) => {
    const courseTotalLessons = course.chapters.reduce(
      (acc, ch) => acc + ch.lessons.length,
      0
    );
    const courseCompletedLessons = course.chapters.reduce(
      (acc, ch) => acc + ch.lessons.filter((l) => l.progress.length > 0).length,
      0
    );
    totalLessons += courseTotalLessons;
    completedLessons += courseCompletedLessons;
  });

  const totalCourses = allUserEnrollments.length;
  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BookOpen className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
          <p className="text-gray-600">
            Track your progress and continue your learning journey
          </p>
        </div>
      </div>

      {/* Stats Cards - Only show if user has courses */}
      {totalCourses > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Enrolled Courses
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalCourses}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Lessons
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalLessons}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedLessons}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Overall Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overallProgress}%
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Bar - Only show if user has courses */}
      {totalCourses > 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <SearchBar />
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            All My Courses{" "}
            {totalCourses > 0 && `(${coursesWithProgress.length} matching)`}
          </h2>
        </div>

        {coursesWithProgress.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-16">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Courses Found
                  </h3>
                  <p className="text-gray-600">Try a different search term.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your learning journey starts here!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You haven&apos;t enrolled in any courses yet.
                  </p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/courses">Explore Courses</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coursesWithProgress.map(({ course, progress }) => (
              <EnrolledCourseCard
                key={course.id}
                course={course}
                progress={progress}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
