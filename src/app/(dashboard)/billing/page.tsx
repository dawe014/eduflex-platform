import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  CreditCard,
  ArrowLeft,
  Calendar,
  DollarSign,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: { select: { title: true, price: true, id: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalSpent = enrollments.reduce((total, enrollment) => {
    return total + (enrollment.course.price || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Purchase History
                </h1>
                <p className="text-muted-foreground mt-1">
                  Your course enrollments and payments
                </p>
              </div>
            </div>

            {enrollments.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-muted-foreground">
                    Total spent:
                  </span>
                  <span className="text-xl font-bold text-emerald-600">
                    ${totalSpent.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {enrollments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Courses
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {enrollments.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold text-green-900">
                      ${totalSpent.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      First Purchase
                    </p>
                    <p className="text-lg font-bold text-purple-900">
                      {enrollments.length > 0
                        ? new Date(
                            enrollments[enrollments.length - 1].createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enrollments Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                My Enrollments
              </CardTitle>
              <Badge variant="secondary" className="text-sm">
                {enrollments.length}{" "}
                {enrollments.length === 1 ? "course" : "courses"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {enrollments.length > 0 ? (
              <div className="rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">
                        Course Title
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">
                        Price
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">
                        Enrollment Date
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow
                        key={enrollment.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <Link
                            href={`/courses/${enrollment.course.id}`}
                            className="hover:text-primary transition-colors flex items-center gap-2"
                          >
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            {enrollment.course.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          {enrollment.course.price ? (
                            <span className="font-semibold text-green-600">
                              ${enrollment.course.price.toFixed(2)}
                            </span>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Free
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(enrollment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="success"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            Enrolled
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="mx-auto w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                  <CreditCard className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No enrollments yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You haven&apos;t enrolled in any courses yet. Start your
                  learning journey today!
                </p>
                <Link href="/courses">
                  <Button className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Browse Courses
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        {enrollments.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help with a purchase?{" "}
              <Link
                href="/contact"
                className="text-primary hover:underline font-medium"
              >
                Contact support
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
