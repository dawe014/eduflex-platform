// File: src/app/courses/[courseId]/learn/layout.tsx
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar"; // New component

const CourseLearnLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: { id: params.courseId },
    include: {
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
  if (!course) {
    return notFound();
  }

  const userProgress = await db.userProgress.findMany({
    /* ... same as before ... */
  });
  const completedLessonIds = userProgress.map((p) => p.lessonId);
  const totalLessons = course.chapters.reduce(
    (acc, c) => acc + c.lessons.length,
    0
  );
  const progressPercentage =
    totalLessons > 0 ? (completedLessonIds.length / totalLessons) * 100 : 0;

  return (
    <div className="h-full">
      <div className="h-[80px] fixed inset-y-0 w-full z-50">
        <CourseNavbar
          course={course}
          completedLessonIds={completedLessonIds}
          progressPercentage={progressPercentage}
        />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50 pt-[80px]">
        <CourseSidebar
          course={course}
          completedLessonIds={completedLessonIds}
          progressPercentage={progressPercentage}
        />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default CourseLearnLayout;
