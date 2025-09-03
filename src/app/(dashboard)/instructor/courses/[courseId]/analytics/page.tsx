import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import {
  BarChart,
  Users,
  DollarSign,
  BookOpen,
  ArrowLeft,
  TrendingUp,
  Calendar,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/app/(dashboard)/admin/overview/_components/chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Helper function to group data by month
const groupEnrollmentsByMonth = (enrollments: { createdAt: Date }[]) => {
  const monthlyData: { [key: string]: number } = {};

  for (const enrollment of enrollments) {
    const month = new Date(enrollment.createdAt).toLocaleString("default", {
      month: "short",
    });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  }

  // Format for the chart
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return monthNames.map((name) => ({
    name,
    students: monthlyData[name] || 0,
    revenue: (monthlyData[name] || 0) * (enrollments[0]?.course?.price || 0),
  }));
};

export default async function CourseAnalyticsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { courseId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");

  const course = await db.course.findUnique({
    where: {
      id: courseId,
      instructorId: session.user.id,
    },
    include: {
      enrollments: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
      chapters: {
        include: {
          lessons: {
            include: {
              progress: {
                where: { isCompleted: true },
              },
            },
          },
        },
      },
      category: true,
      reviews: true,
    },
  });

  if (!course) {
    return notFound();
  }

  const totalStudents = course.enrollments.length;
  const totalRevenue = (course.price || 0) * totalStudents;
  const totalChapters = course.chapters.length;
  const totalLessons = course.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0
  );

  const averageRating =
    course.reviews.length > 0
      ? course.reviews.reduce((acc, review) => acc + review.rating, 0) /
        course.reviews.length
      : 0;
  const ratingCount = course.reviews.length;

  const chartData = groupEnrollmentsByMonth(course.enrollments as any);

  const completedStudents = new Set<string>();
  for (const chapter of course.chapters) {
    for (const lesson of chapter.lessons) {
      for (const progress of lesson.progress) {
        if (progress.isCompleted) {
          completedStudents.add(progress.userId);
        }
      }
    }
  }
  const completionRate =
    totalStudents > 0 ? (completedStudents.size / totalStudents) * 100 : 0;
  const lastEnrollment = course.enrollments[course.enrollments.length - 1];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex-1">
          <Link
            href={`/instructor/courses`}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to All Courses
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Course Analytics
            </h1>
          </div>
          <p className="text-gray-600">
            Performance insights for:{" "}
            <span className="font-semibold">{course.title}</span>
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {course.category?.name || "Uncategorized"}
        </Badge>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalStudents}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active enrollments</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">
              Course Content
            </CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <BookOpen className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalLessons}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totalChapters} chapters • {totalLessons} lessons
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <div className="p-2 bg-amber-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {averageRating.toFixed(1)}/5
            </div>
            <p className="text-xs text-gray-500 mt-1">{ratingCount} reviews</p>
          </CardContent>
        </Card>
      </div>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <CardTitle>Revenue Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Chart data={chartData} dataKey="revenue" color="#10b981" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle>Student Growth</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Chart data={chartData} dataKey="students" color="#3b82f6" />
          </CardContent>
        </Card>
      </div>
      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <CardTitle>Completion Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Avg. course completion
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {completionRate.toFixed(0)}%
                </span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <p className="text-xs text-gray-500">
                {completedStudents.size} of {totalStudents} students have
                finished
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last enrollment</span>
                <span className="text-sm font-medium text-gray-900">
                  {lastEnrollment
                    ? new Date(lastEnrollment.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Course created</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last updated</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(course.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="outline">
              <Link href={`/instructor/courses/${course.id}/students`}>
                <Users className="h-4 w-4 mr-2" />
                View Students
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/instructor/courses/${course.id}`}>
                <BookOpen className="h-4 w-4 mr-2" />
                Edit Course
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/courses/${course.id}`} target="_blank">
                <Target className="h-4 w-4 mr-2" />
                View Live Course
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>{" "}
    </div>
  );
}
