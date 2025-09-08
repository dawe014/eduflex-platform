import { Video, CheckCircle, Edit } from "lucide-react";
import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Pagination } from "@/components/pagination";
import { CourseFilters } from "./_components/course-filters";
import { CourseActions } from "./_components/course-actions";
import { Prisma } from "@prisma/client";

const COURSES_PER_PAGE = 10;

export default async function ManageCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: "published" | "draft";
  }>;
}) {
  // ✅ Await searchParams because it's a Promise now
  const { page, search, status } = await searchParams;

  const currentPage = Number(page) || 1;
  const searchTerm = search || "";
  const statusFilter =
    status === "published" || status === "draft" ? status : undefined;

  const whereClause: Prisma.CourseWhereInput = {
    AND: [
      searchTerm
        ? {
            OR: [
              { title: { contains: searchTerm, mode: "insensitive" } },
              {
                instructor: {
                  name: { contains: searchTerm, mode: "insensitive" },
                },
              },
            ],
          }
        : {},
      statusFilter ? { isPublished: statusFilter === "published" } : {},
    ],
  };

  // --- Fetch Data ---
  const courses = await db.course.findMany({
    where: whereClause,
    include: { instructor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * COURSES_PER_PAGE,
    take: COURSES_PER_PAGE,
  });

  const totalCourses = await db.course.count({ where: whereClause });
  const pageCount = Math.ceil(totalCourses / COURSES_PER_PAGE);

  // --- Stats ---
  const [allCoursesCount, publishedCount] = await Promise.all([
    db.course.count(),
    db.course.count({ where: { isPublished: true } }),
  ]);
  const draftCount = allCoursesCount - publishedCount;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Video className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Course Management
            </h1>
            <p className="text-gray-600">Oversee all courses on the platform</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allCoursesCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <CourseFilters />
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            {totalCourses} course{totalCourses !== 1 ? "s" : ""} matching
            filters
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-gray-50/50">
                    <TableCell className="pl-6 font-medium text-gray-800">
                      {course.title}
                    </TableCell>
                    <TableCell>{course.instructor?.name || "N/A"}</TableCell>
                    <TableCell>
                      ${course.price ? course.price.toFixed(2) : "Free"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={course.isPublished ? "default" : "secondary"}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <CourseActions
                        courseId={course.id}
                        isPublished={course.isPublished}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {courses.length === 0 && (
            <div className="text-center py-16">
              <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters.
              </p>
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
