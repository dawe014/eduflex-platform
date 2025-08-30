import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Shield,
  Calendar,
  UserCheck,
} from "lucide-react";
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
import { UserActions } from "./_components/user-actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserFilters } from "./_components/user-filters";
import { Pagination } from "@/components/pagination";
import { UserRole } from "@prisma/client";
import { AddUserModal } from "./_components/add-user-modal";

const USERS_PER_PAGE = 10;

export default async function ManageUsersPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    role?: UserRole;
    sort?: string;
  };
}) {
  const { page, search, role, sort } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return redirect("/");

  const currentPage = Number(page) || 1;
  const searchTerm = search || "";
  const roleFilter = role;
  const sortBy = sort || "newest";

  // --- Construct Prisma Where and OrderBy Clauses ---
  const whereClause: any = {
    AND: [
      {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      roleFilter && roleFilter !== "all" ? { role: roleFilter } : {},
    ],
  };

  const orderByClause =
    sortBy === "oldest"
      ? { createdAt: "asc" as const }
      : { createdAt: "desc" as const };

  // --- Fetch Data ---
  const users = await db.user.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      _count: {
        select: { courses: true, enrollments: true },
      },
    },
    skip: (currentPage - 1) * USERS_PER_PAGE,
    take: USERS_PER_PAGE,
  });

  const totalUsers = await db.user.count({ where: whereClause });
  const pageCount = Math.ceil(totalUsers / USERS_PER_PAGE);

  // Stats should reflect the entire user base, not just the filtered results
  const allUsersStats = await db.user.groupBy({
    by: ["role"],
    _count: {
      role: true,
    },
  });
  const totalUserCount = await db.user.count();
  const totalInstructors =
    allUsersStats.find((s) => s.role === "INSTRUCTOR")?._count.role || 0;
  const totalAdmins =
    allUsersStats.find((s) => s.role === "ADMIN")?._count.role || 0;
  const activeUsers = await db.user.count({
    where: { emailVerified: { not: null } },
  });

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage all users and their permissions
            </p>
          </div>
        </div>
        <AddUserModal />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalUserCount}
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
                <p className="text-sm font-medium text-gray-600">Instructors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalInstructors}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalAdmins}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Verified Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeUsers}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <UserFilters />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>All Users ({totalUsers})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50/50">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-gray-100">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "ADMIN"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : user.role === "INSTRUCTOR"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">
                          {user._count.courses}
                        </span>{" "}
                        created •{" "}
                        <span className="font-medium">
                          {user._count.enrollments}
                        </span>{" "}
                        enrolled
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.emailVerified
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {user.emailVerified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {user.createdAt.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {user.id !== session?.user.id ? (
                        <UserActions userId={user.id} currentRole={user.role} />
                      ) : (
                        <span className="text-sm text-gray-500">
                          Current user
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No users found
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
