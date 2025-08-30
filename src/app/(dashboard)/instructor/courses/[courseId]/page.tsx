// File: src/app/(dashboard)/instructor/courses/[courseId]/page.tsx
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { IconBadge } from "@/components/icon-badge";
import {
  BookOpen,
  LayoutDashboard,
  CheckCircle,
  AlertCircle,
  Target,
  BarChart3,
} from "lucide-react";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { PriceForm } from "./_components/price-form";
import { CategoryForm } from "./_components/category-form";
import { ChaptersForm } from "./_components/chapters-form";
import { CourseActions } from "./_components/course-actions";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LearningsForm } from "./_components/learnings-form";
import { RequirementsForm } from "./_components/requirements-form";
import { IncludesForm } from "./_components/includes-form";

export default async function InstructorCourseIdPage({
  params,
}: {
  params: { courseId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "INSTRUCTOR") {
    return redirect("/");
  }
  const { courseId } = await params;

  const course = await db.course.findUnique({
    where: {
      id: courseId,
      instructorId: session.user.id,
    },
    include: {
      chapters: {
        orderBy: {
          position: "asc",
        },
        include: {
          lessons: {
            where: {
              isPublished: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      },
      category: true,
      enrollments: true,
    },
  });

  if (!course) {
    return notFound();
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.learnings,
    course.includes,
    course.requirements,
    course.categoryId,
    course.chapters.some((chapter) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionPercentage = (completedFields / totalFields) * 100;
  const isComplete = requiredFields.every(Boolean);

  // Calculate course statistics
  const totalLessons = course.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0
  );
  const totalStudents = course.enrollments.length;
  const totalRevenue = (course.price || 0) * totalStudents;

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Course Setup</h1>
          <p className="text-gray-600 mt-2">
            Customize and manage your course content
          </p>
        </div>
        <CourseActions
          disabled={!isComplete}
          courseId={courseId}
          isPublished={course.isPublished}
        />
      </div>

      {/* Progress and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Progress Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Completion Status</h3>
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

        {/* Students Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Students</h3>
              <div className="p-2 bg-blue-100 rounded-full">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            <p className="text-sm text-gray-600">Total enrolled</p>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Revenue</h3>
              <div className="p-2 bg-green-100 rounded-full">
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${totalRevenue.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Total earnings</p>
          </CardContent>
        </Card>

        {/* Lessons Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Content</h3>
              <div className="p-2 bg-purple-100 rounded-full">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalLessons}</p>
            <p className="text-sm text-gray-600">Published lessons</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Setup Forms */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column - Course Details */}
        <div className="space-y-6">
          {/* Course Information Section */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <IconBadge icon={LayoutDashboard} variant="primary" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Course Information
                </h2>
              </div>
              <div className="space-y-6">
                <TitleForm initialData={course} courseId={course.id} />
                <DescriptionForm initialData={course} courseId={course.id} />
                <ImageForm initialData={course} courseId={course.id} />
                <CategoryForm
                  initialData={course}
                  courseId={course.id}
                  options={categories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Section */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <IconBadge icon={BarChart3} variant="primary" />
                <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
              </div>
              <PriceForm initialData={course} courseId={course.id} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Chapters */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <IconBadge icon={BookOpen} variant="primary" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Chapter Management
                </h2>
              </div>
              <LearningsForm initialData={course} courseId={course.id} />
              <RequirementsForm initialData={course} courseId={course.id} />
              <IncludesForm initialData={course} courseId={course.id} />
              <ChaptersForm initialData={course} courseId={course.id} />
            </CardContent>
          </Card>

          {/* Completion Status */}
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
                  ? "Your course is complete and ready to be published. Students can now enroll and start learning!"
                  : "Complete all required fields to publish your course. Make sure all chapters have published lessons."}
              </p>
              <div className="space-y-3">
                {[
                  { label: "Course Title", completed: !!course.title },
                  {
                    label: "Course Description",
                    completed: !!course.description,
                  },
                  { label: "Course Image", completed: !!course.imageUrl },
                  { label: "Course Category", completed: !!course.categoryId },
                  { label: "Course Price", completed: !!course.price },
                  {
                    label: "Published Chapters",
                    completed: course.chapters.some(
                      (chapter) => chapter.isPublished
                    ),
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
