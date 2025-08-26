// File: src/app/(dashboard)/admin/overview/page.tsx
import { BarChart, Users, Video, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { Chart } from "./_components/chart"; // Create this component

export default async function AdminOverviewPage() {
  const [totalUsers, totalCourses, enrollments] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.enrollment.findMany({ include: { course: true } }),
  ]);

  const totalRevenue = enrollments.reduce(
    (acc, e) => acc + (e.course?.price || 0),
    0
  );
  const totalEnrollments = enrollments.length;

  // You can create more complex chart data here
  const chartData = [{ name: "Sample", total: 100 }];

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <BarChart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Platform Overview</h1>
      </div>
      {/* ... (Stat Cards with the fetched data) ... */}
      <Chart data={chartData} />
    </div>
  );
}
