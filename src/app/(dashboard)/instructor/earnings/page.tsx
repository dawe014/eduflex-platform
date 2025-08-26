// File: src/app/(dashboard)/instructor/earnings/page.tsx
import { DollarSign, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Chart } from "../../admin/overview/_components/chart"; // Reuse chart

export default async function EarningsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");

  const courses = await db.course.findMany({
    where: { instructorId: session.user.id },
    include: { enrollments: true },
  });

  const totalRevenue = courses.reduce((acc, course) => {
    return acc + (course.price || 0) * course.enrollments.length;
  }, 0);

  const totalEnrollments = courses.reduce((acc, course) => {
    return acc + course.enrollments.length;
  }, 0);

  const chartData = courses.map((course) => ({
    name: course.title,
    total: (course.price || 0) * course.enrollments.length,
  }));

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <DollarSign className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Earnings & Analytics</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
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
            <CardTitle>Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Per Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
