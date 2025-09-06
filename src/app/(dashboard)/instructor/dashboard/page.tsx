import { StatCard } from "@/components/instructor/stat-card";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DollarSign, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InstructorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect("/");
  }

  const courses = await db.course.findMany({
    where: {
      instructorId: session.user.id,
    },
    include: {
      enrollments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalRevenue = courses.reduce((acc, course) => {
    const courseRevenue = (course.price || 0) * course.enrollments.length;
    return acc + courseRevenue;
  }, 0);

  const totalStudents = courses.reduce((acc, course) => {
    return acc + course.enrollments.length;
  }, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
        />
        <StatCard title="Total Students" value={totalStudents} icon={Users} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Courses</h1>
        <Button asChild>
          <Link href="/instructor/create-course">Create New Course</Link>
        </Button>
      </div>

      {/* List of courses */}
      <div className="rounded-md border">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center justify-between p-4 border-b last:border-b-0"
          >
            <p className="font-medium">{course.title}</p>
            <div className="flex items-center gap-x-4">
              <span className="text-sm text-muted-foreground">
                {course.enrollments.length} Student(s)
              </span>
              <Button variant="outline" size="sm">
                <Link href={`/instructor/courses/${course.id}`}>Edit</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
