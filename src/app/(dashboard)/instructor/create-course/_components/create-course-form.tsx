"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createCourse } from "@/actions/course-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Sparkles, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long." }),
  description: z.string().optional(),
});

export const CreateCourseForm = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("title", values.title);
    if (values.description) {
      formData.append("description", values.description);
    }

    toast.info("Creating your course...");

    startTransition(async () => {
      try {
        await createCourse(formData);
      } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "digest" in error) {
          const digest = (error as { digest?: string }).digest;
          if (digest?.includes("NEXT_REDIRECT")) {
            throw error;
          }
        }

        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    });
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Plus className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Create New Course
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Start your teaching journey with a great course title
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <Label
                    htmlFor="title"
                    className="text-base font-medium text-gray-900"
                  >
                    Course Title *
                  </Label>
                  <FormControl>
                    <Input
                      {...field}
                      id="title"
                      placeholder="e.g., 'Advanced Next.js Development...'"
                      className="h-12 text-lg mt-2"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-600 pt-1 flex items-center gap-1">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Choose a clear, descriptive title.
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <Label
                    htmlFor="description"
                    className="text-base font-medium text-gray-900"
                  >
                    Brief Description (Optional)
                  </Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      id="description"
                      placeholder="Describe what students will learn..."
                      rows={3}
                      className="mt-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 lg:flex-none"
                onClick={() => router.push("/instructor/courses")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 lg:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create and Continue
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
