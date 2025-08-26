import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { BarChart, Users, DollarSign, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/app/(dashboard)/admin/overview/_components/chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CourseAnalyticsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      instructorId: session.user.id,
    },
    include: {
      enrollments: true,
      chapters: {
        include: {
          lessons: true,
        },
      },
    },
  });

  if (!course) {
    return notFound();
  }

  const totalStudents = course.enrollments.length;
  const totalRevenue = (course.price || 0) * totalStudents;
  const totalLessons = course.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0
  );

  // For a real app, you would fetch more detailed, time-series data for the chart
  const chartData = [
    { name: "Jan", total: 0 },
    { name: "Feb", total: 0 },
    { name: "Mar", total: 0 },
    { name: "Apr", total: 0 },
    { name: "May", total: 0 },
    { name: "Jun", total: 0 },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics for: {course.title}</h1>
        <Button asChild variant="outline">
          <Link href={`/instructor/courses/${course.id}`}>
            Back to Course Setup
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
