import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Reviews } from "@/components/courses/reviews";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, BookOpen, CheckCircle, ListChecks, Clock } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EnrollmentStatus } from "@/components/courses/enrollment-status";
import { WishlistButton } from "@/components/courses/wishlist-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CourseContentAccordion } from "./_components/course-content-accordion";
import { CourseHero } from "./_components/course-hero";
import {
  calculateTotalCourseDuration,
  calculateChapterDuration,
} from "@/lib/duration-helper";

interface CourseIdPageProps {
  params: { courseId: string };
}

export default async function CourseIdPage({ params }: CourseIdPageProps) {
  const session = await getServerSession(authOptions);
  const { courseId } = await params;

  const course = await db.course.findUnique({
    where: { id: courseId, isPublished: true },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      instructor: {
        select: {
          name: true,
          image: true,
          bio: true,
          _count: { select: { courses: true, enrollments: true } },
        },
      },
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
          },
        },
      },
      enrollments: true,
    },
  });

  if (!course) {
    return notFound();
  }

  const instructorStats = await db.user.findUnique({
    where: { id: course.instructorId },
    include: {
      courses: {
        include: {
          _count: {
            select: { enrollments: true },
          },
        },
      },
    },
  });

  const totalInstructorStudents =
    instructorStats?.courses.reduce((sum, currentCourse) => {
      return sum + currentCourse._count.enrollments;
    }, 0) || 0;

  // --- Dynamic Data Calculations ---
  const allLessons = course.chapters.flatMap((chapter) => chapter.lessons);
  const totalLessons = allLessons.length;
  const totalDuration = calculateTotalCourseDuration(course.chapters);

  const chaptersWithDurations = course.chapters.map((chapter) => ({
    ...chapter,
    totalDuration: calculateChapterDuration(chapter.lessons),
  }));

  const studentCount = course.enrollments.length;
  const reviewCount = course.reviews.length;
  const averageRating =
    reviewCount > 0
      ? course.reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviewCount
      : 0;

  const previewLesson =
    allLessons.find((lesson) => lesson.isFree && lesson.videoUrl) || null;

  let isEnrolled = false;
  let isWishlisted = false;
  if (session?.user) {
    isEnrolled = !!(await db.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    }));
    isWishlisted = !!(await db.wishlist.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      <CourseHero
        course={course}
        totalLessons={totalLessons}
        averageRating={averageRating}
        previewLesson={previewLesson}
        totalDuration={totalDuration}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {course.learnings && course.learnings.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    What you'll learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {course.learnings.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  Course Content
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    {course.chapters.length} chapters • {totalLessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {totalDuration} total length
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <CourseContentAccordion chapters={chaptersWithDurations} />
              </CardContent>
            </Card>

            {course.requirements && course.requirements.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <ListChecks className="h-6 w-6 text-amber-600" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {course.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  Instructor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage src={course.instructor?.image || ""} />
                    <AvatarFallback>
                      {course.instructor?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {course.instructor?.name || "Expert Instructor"}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {course.instructor?.bio ||
                        "Seasoned professional with years of industry experience."}
                    </p>
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>
                          {totalInstructorStudents.toLocaleString()} Students
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />

                        <span>{course.instructor?._count.courses} Courses</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Reviews reviews={course.reviews} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl">
                  {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                </CardTitle>
                <p className="text-blue-100">
                  One-time payment, lifetime access
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <EnrollmentStatus
                  courseId={course.id}
                  isEnrolled={isEnrolled}
                />
                {course.includes && course.includes.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-semibold text-gray-900">
                      This course includes:
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">
                          {totalDuration} on-demand video
                        </span>
                      </div>
                      {course.includes.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-6 pt-0 flex items-center justify-center">
                <WishlistButton
                  courseId={course.id}
                  isWishlisted={isWishlisted}
                />
                <span className="ml-2 text-sm text-gray-600">
                  Add to Wishlist
                </span>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
