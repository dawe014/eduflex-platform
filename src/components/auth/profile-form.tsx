"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { User } from "@prisma/client";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
});

interface ProfileFormProps {
  user: User;
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: user.name || "", bio: user.bio || "" },
  });
  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated successfully!");
      router.refresh(); // Refreshes the server component to show the new name in the header
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Public Profile</CardTitle>
        <CardDescription>
          This information will be displayed publicly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="text-3xl">
              {user.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground capitalize mt-1">
              {user.role.toLowerCase()}
            </p>
          </div>
        </div>
        <Separator className="my-6" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {user.role === "INSTRUCTOR" && (
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell students about your expertise, background, and teaching style."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
