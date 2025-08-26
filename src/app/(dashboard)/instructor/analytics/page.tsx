// File: .../analytics/page.tsx
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Chart } from "./_components/chart";

const InstructorAnalyticsPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");

  const courses = await db.course.findMany({
    where: { instructorId: session.user.id },
    include: { enrollments: true },
  });

  // Format data for the chart
  const data = courses.map((course) => ({
    name: course.title,
    total: course.enrollments.length,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Enrollment Analytics</h1>
      <Chart data={data} />
    </div>
  );
};

export default InstructorAnalyticsPage;
