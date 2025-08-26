import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  Video,
  PlusCircle,
  Users,
  DollarSign,
  Eye,
  Edit3,
  MoreVertical,
  BarChart,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Pagination } from "@/components/pagination";

const COURSES_PER_PAGE = 5;

export default async function InstructorCoursesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");
  // Determine current page
  const { page } = await searchParams;

  const currentPage = Number(page) || 1;

  // Fetch paginated courses
  const courses = await db.course.findMany({
    where: { instructorId: session.user.id },
    include: {
      enrollments: true,
      category: true,
      chapters: {
        where: { isPublished: true },
        include: {
          lessons: {
            where: { isPublished: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * COURSES_PER_PAGE,
    take: COURSES_PER_PAGE,
  });

  // Fetch total count for pagination
  const totalCourses = await db.course.count({
    where: { instructorId: session.user.id },
  });

  const pageCount = Math.ceil(totalCourses / COURSES_PER_PAGE);

  // Fetch stats for all courses
  const allCourses = await db.course.findMany({
    where: { instructorId: session.user.id },
    include: { enrollments: true },
  });
  const totalStudents = allCourses.reduce(
    (acc, course) => acc + course.enrollments.length,
    0
  );
  const totalRevenue = allCourses.reduce(
    (acc, course) => acc + (course.price || 0) * course.enrollments.length,
    0
  );
  const publishedCourses = allCourses.filter(
    (course) => course.isPublished
  ).length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Video className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600">Manage and create your courses</p>
          </div>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Link href="/instructor/create-course">
            <PlusCircle className="h-5 w-5 mr-2" />
            Create New Course
          </Link>
        </Button>
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
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalRevenue.toFixed(2)}
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
                  Published Courses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {publishedCourses}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="px-6 py-4 border-b">
          <CardTitle className="text-xl">All Courses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Course</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead className="text-center">Revenue</TableHead>
                <TableHead className="text-центер">Lessons</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Created</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => {
                const courseRevenue =
                  (course.price || 0) * course.enrollments.length;
                const totalLessons = course.chapters.reduce(
                  (acc, chapter) => acc + chapter.lessons.length,
                  0
                );

                return (
                  <TableRow key={course.id} className="hover:bg-gray-50/50">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {course.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {course.category?.name || "Uncategorized"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">
                          {course.enrollments.length}
                        </span>
                        <Progress
                          value={
                            (course.enrollments.length /
                              Math.max(totalStudents, 1)) *
                            100
                          }
                          className="w-16 h-2 mt-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-green-600">
                        ${courseRevenue.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{totalLessons}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={course.isPublished ? "default" : "secondary"}
                        className={
                          course.isPublished
                            ? "bg-green-100 text-green-800 hover:bg-green-100 border-0"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100 border-0"
                        }
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/courses/${course.id}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/instructor/courses/${course.id}`}>
                            <Edit3 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/instructor/courses/${course.id}/analytics`}
                              >
                                <BarChart className="h-4 w-4 mr-2" />
                                Analytics
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/instructor/courses/${course.id}/students`}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Students
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No courses yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first course to start teaching
              </p>
              <Button asChild>
                <Link href="/instructor/create-course">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
        {pageCount > 1 && (
          <div className="p-4 border-t">
            <Pagination pageCount={pageCount} />
          </div>
        )}
      </Card>
    </div>
  );
}
