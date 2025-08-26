import { Video } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function ManageCoursesPage() {
  // TODO: Fetch all courses
  const courses = [
    {
      id: "1",
      title: "The Ultimate Next.js 14 Course",
      instructor: "Bob Smith",
      isPublished: true,
      price: 49.99,
    },
    {
      id: "2",
      title: "Advanced TypeScript",
      instructor: "Bob Smith",
      isPublished: true,
      price: 39.99,
    },
    {
      id: "3",
      title: "UI/UX Fundamentals",
      instructor: "Bob Smith",
      isPublished: false,
      price: 19.99,
    },
  ];
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <Video className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Manage Courses</h1>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{course.instructor}</TableCell>
                <TableCell>${course.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={course.isPublished ? "success" : "outline"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* TODO: Add pagination and course actions (approve/reject) */}
    </div>
  );
}
