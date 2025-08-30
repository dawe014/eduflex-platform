"use client";

import { addUserByAdmin } from "@/actions/user-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Plus,
  Copy,
  Check,
  User,
  Mail,
  Shield,
  UserCheck,
  Loader2,
} from "lucide-react";
import { UserRole } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("A valid email is required"),
  role: z.nativeEnum(UserRole),
});

export const AddUserModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    temporaryPassword?: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasCopied, setHasCopied] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", role: UserRole.STUDENT },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        const res = await addUserByAdmin(values);
        setResult(res);
        toast.success(res.message);
        form.reset();
      } catch (error: any) {
        toast.error(error.message || "Failed to create user");
      }
    });
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setResult(null);
      setHasCopied(false);
      form.reset();
    }
    setIsOpen(open);
  };

  const copyToClipboard = () => {
    if (result?.temporaryPassword) {
      navigator.clipboard.writeText(result.temporaryPassword);
      setHasCopied(true);
      toast.success("Password copied to clipboard!");
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4" />;
      case "INSTRUCTOR":
        return <UserCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "text-red-600 bg-red-50 border-red-200";
      case "INSTRUCTOR":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Create New User
              </DialogTitle>
              <DialogDescription>
                Add a new user to the platform with a specific role
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {result?.success ? (
          <div className="space-y-6 py-2">
            {/* Success Message */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                User Created Successfully!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {result.message} Share the temporary password with the user.
              </p>
            </div>

            {/* Password Display */}
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Temporary Password
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700 border-amber-200"
                  >
                    One-time use
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 font-mono text-sm bg-white px-3 py-2 rounded-md border border-gray-200">
                    {result.temporaryPassword}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={copyToClipboard}
                    className="h-10 w-10"
                  >
                    {hasCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This password will be required for the user's first login
                </p>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">
                Next Steps
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Share the password securely with the user</li>
                <li>
                  • Instruct them to change their password after first login
                </li>
                <li>• The user will receive a welcome email</li>
              </ul>
            </div>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John Doe"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="john@example.com"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        User Role
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem
                            value={UserRole.STUDENT}
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            Student
                          </SelectItem>
                          <SelectItem
                            value={UserRole.INSTRUCTOR}
                            className="flex items-center gap-2"
                          >
                            <UserCheck className="h-4 w-4" />
                            Instructor
                          </SelectItem>
                          <SelectItem
                            value={UserRole.ADMIN}
                            className="flex items-center gap-2"
                          >
                            <Shield className="h-4 w-4" />
                            Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Role Description */}
              {form.watch("role") && (
                <div
                  className={`p-3 rounded-lg border ${getRoleColor(
                    form.watch("role")
                  )}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getRoleIcon(form.watch("role"))}
                    <span className="text-sm font-medium capitalize">
                      {form.watch("role").toLowerCase()} permissions
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {form.watch("role") === UserRole.ADMIN &&
                      "Full system access and management capabilities"}
                    {form.watch("role") === UserRole.INSTRUCTOR &&
                      "Can create and manage courses, limited system access"}
                    {form.watch("role") === UserRole.STUDENT &&
                      "Can enroll in and access courses, basic user privileges"}
                  </p>
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
