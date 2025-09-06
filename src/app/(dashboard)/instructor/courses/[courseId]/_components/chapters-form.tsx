"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, BookOpen, Grip } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Chapter, Course } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { ChaptersList } from "./chapters-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChaptersFormProps {
  initialData: Course & { chapters: Chapter[] };
  courseId: string;
}

const formSchema = z.object({
  title: z.string().min(1),
});

export const ChaptersForm = ({ initialData, courseId }: ChaptersFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const toggleCreating = () => setIsCreating((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetch(`/api/courses/${courseId}/chapters`, {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success("Chapter created successfully");
      toggleCreating();
      form.reset();
      router.refresh();
    } catch {
      toast.error("Failed to create chapter");
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);
      await fetch(`/api/courses/${courseId}/chapters/reorder`, {
        method: "PUT",
        body: JSON.stringify({ list: updateData }),
      });
      toast.success("Chapters reordered successfully");
      router.refresh();
    } catch {
      toast.error("Failed to reorder chapters");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/instructor/courses/${courseId}/chapters/${id}`);
  };

  return (
    <Card className="border-0 shadow-lg relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Updating order...</p>
          </div>
        </div>
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              Course Chapters
            </CardTitle>
            <p className="text-sm text-gray-600">
              {initialData.chapters.length} chapter
              {initialData.chapters.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          onClick={toggleCreating}
          variant={isCreating ? "outline" : "default"}
          className="gap-2"
        >
          {isCreating ? (
            "Cancel"
          ) : (
            <>
              <PlusCircle className="h-4 w-4" />
              Add Chapter
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent>
        {isCreating && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mb-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g., 'Introduction to the Course'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BookOpen className="h-4 w-4" />
                  )}
                  Create Chapter
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        )}

        {initialData.chapters.length === 0 && !isCreating ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No chapters yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first chapter to organize your course content
            </p>
            <Button onClick={toggleCreating} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create First Chapter
            </Button>
          </div>
        ) : (
          <>
            <ChaptersList
              onEdit={onEdit}
              onReorder={onReorder}
              items={initialData.chapters || []}
            />
            <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
              <Grip className="h-3 w-3" />
              Drag and drop to reorder chapters
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
