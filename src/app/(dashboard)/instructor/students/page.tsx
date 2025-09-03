import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Users, Search, Mail, Calendar, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { SearchInput } from "./_components/search-input";

const STUDENTS_PER_PAGE = 10;

export default async function InstructorStudentsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");
  const { page, search } = await searchParams;

  const currentPage = Number(page) || 1;
  const searchTerm = search || "";

  // Common where clause for both paginated query and total count
  const whereClause = {
    course: { instructorId: session.user.id },
    user: {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" as const } },
        { email: { contains: searchTerm, mode: "insensitive" as const } },
      ],
    },
  };

  // Fetch paginated enrollments
  const enrollments = await db.enrollment.findMany({
    where: whereClause,
    include: { user: true, course: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * STUDENTS_PER_PAGE,
    take: STUDENTS_PER_PAGE,
  });

  // Fetch total count for pagination and stats
  const totalStudents = await db.enrollment.count({ where: whereClause });
  const pageCount = Math.ceil(totalStudents / STUDENTS_PER_PAGE);

  // Fetch stats for all students
  const allEnrollments = await db.enrollment.findMany({
    where: { course: { instructorId: session.user.id } },
  });
  const uniqueStudentIds = new Set(allEnrollments.map((e) => e.userId));
  const uniqueStudents = uniqueStudentIds.size;

  // Placeholder for new students this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const newStudentsThisMonth = await db.enrollment.count({
    where: {
      course: { instructorId: session.user.id },
      createdAt: { gte: thisMonth },
    },
  });

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-600">
            View and manage all your enrolled students
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              {uniqueStudents}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">
              New This Month
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              +{newStudentsThisMonth}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">
              Total Enrollments
            </CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {allEnrollments.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <CardTitle>All Students</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <SearchInput />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Student</TableHead>
                  <TableHead>Enrolled In</TableHead>
                  <TableHead>Enrolled On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id} className="hover:bg-gray-50/50">
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
                    <TableCell className="text-gray-600">
                      {enrollment.course.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {enrollment.createdAt.toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {enrollments.length === 0 && (
            <div className="text-center p-12 text-gray-500">
              <p>No students found for the current search or filters.</p>
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
