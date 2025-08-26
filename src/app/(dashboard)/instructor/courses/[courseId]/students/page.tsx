import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CourseStudentsPage({
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
      enrollments: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Students for: {course.title}</h1>
        <Button asChild variant="outline">
          <Link href={`/instructor/courses/${course.id}`}>
            Back to Course Setup
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Enrolled On</TableHead>
              {/* Add a progress column later */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {course.enrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>
                  <div className="flex items-center gap-x-3">
                    <Avatar>
                      <AvatarImage src={enrollment.user.image || ""} />
                      <AvatarFallback>
                        {enrollment.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{enrollment.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {enrollment.createdAt.toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {course.enrollments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No students have enrolled in this course yet.</p>
        </div>
      )}
    </div>
  );
}
