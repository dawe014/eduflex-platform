import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";

const CourseLearnLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");
  const { courseId } = await params;

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId: courseId },
    },
  });
  if (!enrollment) return redirect(`/courses/${courseId}`);

  // CORRECTED & SIMPLIFIED PRISMA QUERY
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: { select: { name: true, image: true } },
      chapters: {
        where: { isPublished: true },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });
  if (!course) return notFound();

  // Fetch all completed lessons separately for clarity and accuracy
  const userProgress = await db.userProgress.findMany({
    where: {
      userId: session.user.id,
      lesson: { chapter: { courseId: courseId } },
      isCompleted: true,
    },
    select: { lessonId: true },
  });
  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));

  // Calculate progress
  const totalLessons = course.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0
  );
  const completedLessons = completedLessonIds.size;
  const progressPercentage =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const existingReview = await db.review.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId: courseId },
    },
  });

  return (
    <div className="h-full">
      <div className="h-[80px] fixed inset-y-0 w-full z-50">
        <CourseNavbar
          course={course}
          completedLessons={completedLessons}
          totalLessons={totalLessons}
          progressPercentage={progressPercentage}
          existingReview={existingReview}
        />
      </div>

      <div className="hidden lg:flex h-full w-80 flex-col fixed inset-y-0 z-40 pt-[80px]">
        <CourseSidebar
          course={course}
          completedLessonIds={completedLessonIds}
          progressPercentage={progressPercentage}
          existingReview={existingReview}
        />
      </div>

      <main className="lg:pl-80 pt-[80px] h-full">{children}</main>
    </div>
  );
};
export default CourseLearnLayout;
