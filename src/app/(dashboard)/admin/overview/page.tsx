import { BarChart, Users, Video, DollarSign, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { Chart } from "./_components/chart";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Enrollment, Course } from "@prisma/client";

type EnrollmentWithPrice = Enrollment & {
  course: Pick<Course, "price"> | null;
};

// Helper function to process data for the chart
const groupDataByMonth = (enrollments: EnrollmentWithPrice[]) => {
  const monthlyRevenue: { [key: string]: number } = {};

  for (const enrollment of enrollments) {
    const month = new Date(enrollment.createdAt).toLocaleString("default", {
      month: "short",
    });
    monthlyRevenue[month] =
      (monthlyRevenue[month] || 0) + (enrollment.course?.price || 0);
  }

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
    total: monthlyRevenue[name] || 0,
  }));
};

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return redirect("/dashboard");
  }

  const [totalUsers, totalCourses, enrollments, newUsersThisMonth] =
    await Promise.all([
      db.user.count(),
      db.course.count({ where: { isPublished: true } }),
      db.enrollment.findMany({
        include: { course: { select: { price: true } } },
        orderBy: { createdAt: "asc" },
      }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
      }),
    ]);

  const totalRevenue = enrollments.reduce(
    (acc, e) => acc + (e.course?.price || 0),
    0
  );
  const chartData = groupDataByMonth(enrollments as EnrollmentWithPrice[]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Platform Overview
          </h1>
          <p className="text-gray-600">
            A high-level look at your platform&apos;s performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsers.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Published Courses
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCourses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Users (Last 30 Days)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{newUsersThisMonth.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Sales Revenue</CardTitle>
          <CardDescription>
            Total revenue generated per month this year.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Chart data={chartData} dataKey="total" color="#10b981" />
        </CardContent>
      </Card>
    </div>
  );
}
