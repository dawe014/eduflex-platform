import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  MessageSquare,
  Mail,
  CheckCircle,
  Archive,
  User,
  Clock,
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pagination } from "@/components/pagination";
import { MessageActions } from "./_components/message-actions";
import { MessageFilters } from "./_components/message-filters";
import { MessageStatus, Prisma } from "@prisma/client";
import { cn } from "@/lib/utils";

const MESSAGES_PER_PAGE = 10;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    status?: MessageStatus | "all";
    search?: string;
  };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN")
    return redirect("/dashboard");
  const { page, status, search } = await searchParams;
  const currentPage = Number(page) || 1;
  const statusFilter = status;
  const searchTerm = search || "";

  const whereClause: Prisma.ContactMessageWhereInput = {
    AND: [
      statusFilter && statusFilter !== "all" ? { status: statusFilter } : {},
      searchTerm
        ? {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } },
              { subject: { contains: searchTerm, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  // --- Fetch Data ---
  const messages = await db.contactMessage.findMany({
    where: whereClause,
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * MESSAGES_PER_PAGE,
    take: MESSAGES_PER_PAGE,
  });

  const filteredCount = await db.contactMessage.count({ where: whereClause });
  const pageCount = Math.ceil(filteredCount / MESSAGES_PER_PAGE);

  // --- Stats ---
  const [totalMessages, unreadCount, readCount, archivedCount] =
    await Promise.all([
      db.contactMessage.count(),
      db.contactMessage.count({ where: { status: "UNREAD" } }),
      db.contactMessage.count({ where: { status: "READ" } }),
      db.contactMessage.count({ where: { status: "ARCHIVED" } }),
    ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Message Center</h1>
            <p className="text-gray-600 mt-1">
              Manage all user inquiries and feedback
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Messages
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalMessages}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {unreadCount}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Mail className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Read</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {readCount}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Archived</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {archivedCount}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Archive className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <MessageFilters />
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>All Messages</CardTitle>
            <CardDescription>
              {filteredCount} message{filteredCount !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No messages found
                </h3>
                <p className="text-gray-600">
                  {searchTerm || (statusFilter && statusFilter !== "all")
                    ? "Try adjusting your search or filters."
                    : "Your inbox is empty. No messages yet."}
                </p>
              </div>
            ) : (
              <div className="rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-900 pl-6">
                        From
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Subject
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Received
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-right pr-6">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow
                        key={message.id}
                        className={cn(
                          "transition-colors hover:bg-gray-50/50",
                          message.status === "UNREAD" &&
                            "bg-blue-50/80 font-semibold"
                        )}
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="border-2 border-white shadow-sm">
                              <AvatarImage src={message.user?.image || ""} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {message.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {message.name}
                              </p>
                              <p className="text-sm text-gray-600 truncate font-normal">
                                {message.email}
                              </p>
                            </div>
                            {message.userId && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-700"
                              >
                                <User className="h-3 w-3 mr-1" />
                                User
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate font-medium text-gray-900">
                            {message.subject}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              message.status === "UNREAD" &&
                                "bg-blue-100 text-blue-700 border-blue-200",
                              message.status === "READ" &&
                                "bg-green-100 text-green-700 border-green-200",
                              message.status === "ARCHIVED" &&
                                "bg-gray-100 text-gray-700 border-gray-200"
                            )}
                          >
                            {message.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-normal">
                            <Clock className="h-4 w-4" />
                            {new Date(message.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <MessageActions message={message} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
    </div>
  );
}
