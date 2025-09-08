import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { Users, ArrowLeft, Mail, Calendar, Search } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default async function CourseStudentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params; // <-- remove await
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
        orderBy: { createdAt: "desc" },
      },
      chapters: {
        where: { isPublished: true },
        include: {
          lessons: {
            where: { isPublished: true },
            include: { progress: { where: { isCompleted: true } } },
          },
        },
      },
    },
  });

  if (!course) return notFound();

  const totalStudents = course.enrollments.length;
  const totalLessons = course.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0
  );

  const studentsWithProgress = course.enrollments.map((enrollment) => {
    const completedLessonsCount = course.chapters.reduce((acc, chapter) => {
      return (
        acc +
        chapter.lessons.filter((lesson) =>
          lesson.progress.some((p) => p.userId === enrollment.userId)
        ).length
      );
    }, 0);

    const progressPercentage =
      totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;

    return {
      ...enrollment,
      progress: progressPercentage,
    };
  });

  const averageProgress =
    totalStudents > 0
      ? studentsWithProgress.reduce(
          (acc, student) => acc + student.progress,
          0
        ) / totalStudents
      : 0;

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
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Course Students
            </h1>
          </div>
          <p className="text-gray-600">
            Managing {totalStudents} students in:{" "}
            <span className="font-semibold">{course.title}</span>
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {totalStudents} {totalStudents === 1 ? "Student" : "Students"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalStudents}
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
                  Avg Progress
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {averageProgress.toFixed(0)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search students..." className="pl-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
        </CardHeader>
        <CardContent>
          {studentsWithProgress.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Student</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Enrolled On</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsWithProgress.map((enrollment) => (
                    <TableRow
                      key={enrollment.id}
                      className="hover:bg-gray-50/50"
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-gray-100">
                            <AvatarImage src={enrollment.user.image || ""} />
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              {enrollment.user.name?.charAt(0).toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {enrollment.user.name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Mail className="h-3 w-3" />
                              {enrollment.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          <Progress
                            value={enrollment.progress}
                            className="h-2"
                          />
                          <span className="text-xs text-gray-600">
                            {enrollment.progress.toFixed(0)}% complete
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          N/A
                        </div>
                      </TableCell>
                      <TableCell>
                        {enrollment.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm">
                          View Progress
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No students yet
              </h3>
              <p className="text-gray-600">
                Students will appear here once they enroll in your course.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
