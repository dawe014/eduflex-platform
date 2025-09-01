"use client";

import {
  updateMessageStatus,
  deleteContactMessage,
} from "@/actions/contact-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContactMessage, User } from "@prisma/client";
import {
  MoreHorizontal,
  Trash2,
  Archive,
  CheckCircle,
  Mail,
  Eye,
  Reply,
  Clock,
  User as UserIcon,
  Calendar,
  ArrowUpRight,
  MailOpen,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type MessageWithUser = ContactMessage & {
  user: { name: string; image: string | null } | null;
};

export const MessageActions = ({ message }: { message: MessageWithUser }) => {
  const [isPending, startTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mark as read when the view modal is opened
  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (open && message.status === "UNREAD") {
      startTransition(async () => {
        try {
          await updateMessageStatus(message.id, "READ");
          toast.success("Message marked as read");
        } catch (error: any) {
          toast.error(error.message);
        }
      });
    }
  };

  const onArchive = () => {
    startTransition(async () => {
      try {
        const result = await updateMessageStatus(message.id, "ARCHIVED");
        toast.success(result.message);
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  const onMarkAsUnread = () => {
    startTransition(async () => {
      try {
        const result = await updateMessageStatus(message.id, "UNREAD");
        toast.success(result.message);
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  const onDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteContactMessage(message.id);
        toast.success(result.message);
        setIsAlertOpen(false);
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DialogTrigger asChild>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                View Message
              </DropdownMenuItem>
            </DialogTrigger>

            {message.status === "READ" || message.status === "ARCHIVED" ? (
              <DropdownMenuItem
                onClick={onMarkAsUnread}
                disabled={isPending}
                className="flex items-center gap-2 cursor-pointer"
              >
                <MailOpen className="h-4 w-4" />
                Mark as Unread
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={onArchive}
                disabled={isPending}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Archive className="h-4 w-4" />
                Archive
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setIsAlertOpen(true)}
              disabled={isPending}
              className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Delete Message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="max-w-3xl sm:max-w-4xl">
          <DialogHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {message.subject}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2">
                  Message details
                </DialogDescription>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "ml-2",
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
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Sender Information */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarImage src={message.user?.image || ""} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {message.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 truncate">
                    {message.name}
                  </p>
                  {message.userId && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      <UserIcon className="h-3 w-3 mr-1" />
                      Registered User
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 text-sm truncate">
                  {message.email}
                </p>
              </div>
            </div>

            {/* Message Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Received: {formatDate(message.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {Math.floor(
                    (new Date().getTime() -
                      new Date(message.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days ago
                </span>
              </div>
            </div>

            <Separator />

            {/* Message Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Message Content
              </h3>
              <div className="prose prose-gray max-w-none whitespace-pre-wrap leading-relaxed">
                {message.message}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Close
            </Button>
            <Button
              asChild
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
            >
              <a
                href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(
                  message.subject
                )}&body=Dear ${encodeURIComponent(message.name)},%0D%0A%0D%0A`}
                className="flex items-center gap-2"
              >
                <Reply className="h-4 w-4" />
                Reply via Email
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                Delete Message
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete this message from{" "}
              <span className="font-medium text-gray-900">{message.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel
              disabled={isPending}
              className="flex-1 sm:flex-none order-2 sm:order-1 mt-3 sm:mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isPending}
              className="flex-1 sm:flex-none order-1 sm:order-2 bg-red-600 hover:bg-red-700"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </div>
              ) : (
                "Yes, delete message"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
