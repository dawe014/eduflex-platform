import { Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function ManageUsersPage() {
  // TODO: Fetch all users with pagination
  const users = [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "STUDENT",
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      role: "INSTRUCTOR",
      createdAt: new Date(),
    },
    {
      id: "3",
      name: "Charlie Brown",
      email: "charlie@example.com",
      role: "STUDENT",
      createdAt: new Date(),
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Manage Users</h1>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.role === "INSTRUCTOR" ? "default" : "secondary"
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* TODO: Add pagination controls */}
    </div>
  );
}
