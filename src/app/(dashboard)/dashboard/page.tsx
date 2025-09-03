import { EnrolledCourseCard } from "@/components/courses/enrolled-course-card";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookOpen, TrendingUp, Clock, Award } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect("/");
  }

  // Fetch all enrollments with their full course data and progress
  const enrollments = await db.enrollment.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      course: {
        include: {
          instructor: {
            select: {
              name: true,
            },
          },
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
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate progress for each course
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

  // Calculate overall stats
  const totalCourses = coursesWithProgress.length;
  const totalLessons = coursesWithProgress.reduce(
    (acc, course) => acc + course.totalLessons,
    0
  );
  const completedLessons = coursesWithProgress.reduce(
    (acc, course) => acc + course.completedLessons,
    0
  );
  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BookOpen className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-600">Continue your learning journey today.</p>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* My Learning Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Learning</h2>
          <Button asChild variant="outline">
            <Link href="/courses">Browse More Courses</Link>
          </Button>
        </div>

        {coursesWithProgress.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-16">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No courses yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't enrolled in any courses yet.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/courses">Explore Courses</Link>
              </Button>
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

      {coursesWithProgress.some((course) => course.progress < 100) && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Continue Learning
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coursesWithProgress
              .filter((course) => course.progress < 100)
              .slice(0, 4)
              .map(({ course, progress }) => (
                <EnrolledCourseCard
                  key={course.id}
                  course={course}
                  progress={progress}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
