import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminSupportPage() {
  const tickets = await db.contactTicket.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <MessageSquare className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Support Tickets</h1>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.subject}</TableCell>
                <TableCell>{ticket.user.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={ticket.status === "OPEN" ? "default" : "secondary"}
                  >
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(ticket.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/support/${ticket.id}`}>
                      View Ticket
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
