import {
  BarChart,
  Users,
  Video,
  DollarSign,
  BookOpen,
  TrendingUp,
} from "lucide-react";
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

// Helper function to process data for the chart
const groupDataByMonth = (
  enrollments: { createdAt: Date; course?: { price?: number | null } }[]
) => {
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

  // --- Fetch all necessary data in parallel for efficiency ---
  const [totalUsers, totalCourses, enrollments, newUsersThisMonth] =
    await Promise.all([
      db.user.count(),
      db.course.count({ where: { isPublished: true } }),
      db.enrollment.findMany({
        include: { course: { select: { price: true } } },
        orderBy: { createdAt: "asc" },
      }),
      db.user.count({
        where: { createdAt: { gte: new Date(new Date().setDate(1)) } },
      }),
    ]);

  const totalRevenue = enrollments.reduce(
    (acc, e) => acc + (e.course?.price || 0),
    0
  );
  const totalEnrollments = enrollments.length;

  // --- Process data for the chart ---
  const chartData = groupDataByMonth(enrollments as any);

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
            A high-level look at your platform's performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {totalRevenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Published Courses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCourses.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  New Users This Month
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  +{newUsersThisMonth.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
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
          {/* --- Correctly pass props to the Chart component --- */}
          <Chart data={chartData} dataKey="total" color="#10b981" />
        </CardContent>
      </Card>
    </div>
  );
}
