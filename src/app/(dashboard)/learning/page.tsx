import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EnrolledCourseCard } from "@/components/courses/enrolled-course-card";

export default async function MyLearningPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect("/");
  }

  // Fetch all enrollments with their full course data and progress
  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
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
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    return { course, progress };
  });

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <BookOpen className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">My Learning</h1>
      </div>

      {coursesWithProgress.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">
            You are not enrolled in any courses yet.
          </p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
  );
}
