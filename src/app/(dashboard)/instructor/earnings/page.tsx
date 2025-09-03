import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import {
  DollarSign,
  Users,
  Video,
  TrendingUp,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "../../admin/overview/_components/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Helper function to group data by month
const groupEnrollmentsByMonth = (
  enrollments: { createdAt: Date; course?: { price?: number | null } }[]
) => {
  const monthlyData: { [key: string]: { revenue: number; students: number } } =
    {};

  for (const enrollment of enrollments) {
    const month = new Date(enrollment.createdAt).toLocaleString("default", {
      month: "short",
    });
    if (!monthlyData[month]) {
      monthlyData[month] = { revenue: 0, students: 0 };
    }
    monthlyData[month].revenue += enrollment.course?.price || 0;
    monthlyData[month].students += 1;
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
    revenue: monthlyData[name]?.revenue || 0,
    students: monthlyData[name]?.students || 0,
  }));
};

export default async function EarningsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");

  const courses = await db.course.findMany({
    where: { instructorId: session.user.id },
    include: {
      enrollments: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const allEnrollments = courses.flatMap((course) =>
    course.enrollments.map((e) => ({ ...e, course: { price: course.price } }))
  );

  const totalRevenue = allEnrollments.reduce(
    (acc, e) => acc + (e.course.price || 0),
    0
  );
  const totalStudents = allEnrollments.length;
  const totalCourses = courses.length;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthlyRevenue = allEnrollments
    .filter((e) => {
      const enrollmentDate = new Date(e.createdAt);
      return (
        enrollmentDate.getMonth() === thisMonth &&
        enrollmentDate.getFullYear() === thisYear
      );
    })
    .reduce((acc, e) => acc + (e.course.price || 0), 0);

  const chartData = groupEnrollmentsByMonth(allEnrollments);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-green-100 rounded-lg">
          <DollarSign className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600">
            Track your revenue and course performance
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">
              Lifetime Revenue
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${monthlyRevenue.toFixed(2)}
            </div>
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
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <Video className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalCourses}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <CardTitle>Monthly Revenue</CardTitle>
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
              <CardTitle>Monthly Enrollments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Chart data={chartData} dataKey="students" color="#3b82f6" />
          </CardContent>
        </Card>
      </div>

      {/* Top Courses Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Top Performing Courses</CardTitle>
          <p className="text-sm text-gray-500">
            Your most popular courses by student enrollment.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Course</TableHead>
                  <TableHead className="text-center">Students</TableHead>
                  <TableHead className="text-center">Revenue</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses
                  .sort((a, b) => b.enrollments.length - a.enrollments.length)
                  .slice(0, 5)
                  .map((course) => (
                    <TableRow key={course.id} className="hover:bg-gray-50/50">
                      <TableCell className="pl-6 font-medium text-gray-900">
                        {course.title}
                      </TableCell>
                      <TableCell className="text-center">
                        {course.enrollments.length}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-green-600">
                        $
                        {(
                          (course.price || 0) * course.enrollments.length
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button asChild variant="ghost" size="sm">
                          <Link
                            href={`/instructor/courses/${course.id}/analytics`}
                          >
                            View Analytics
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payouts Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Payout Settings</CardTitle>
          <p className="text-sm text-gray-500">
            Manage your payment information and view payout history.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 bg-gray-50 rounded-lg">
          <div>
            <p className="font-semibold">Stripe Account Connected</p>
            <p className="text-sm text-gray-600">
              Your earnings will be paid out monthly via Stripe.
            </p>
          </div>
          <Button variant="outline" className="mt-4 md:mt-0">
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Payouts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
