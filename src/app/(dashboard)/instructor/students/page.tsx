import { Users } from "lucide-react";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function InstructorStudentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");

  // Fetch all enrollments for this instructor's courses and include the user data
  const enrollments = await db.enrollment.findMany({
    where: {
      course: { instructorId: session.user.id },
    },
    include: { user: true, course: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">My Students</h1>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Enrolled In</TableHead>
              <TableHead>Enrolled On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => (
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
                <TableCell>{enrollment.course.title}</TableCell>
                <TableCell>
                  {enrollment.createdAt.toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
