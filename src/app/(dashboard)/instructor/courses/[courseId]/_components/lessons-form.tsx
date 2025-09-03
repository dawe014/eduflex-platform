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
import { Loader2, PlusCircle, Video, Grip } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Chapter, Lesson } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { LessonsList } from "./lessons-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LessonsFormProps {
  initialData: Chapter & { lessons: Lesson[] };
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const LessonsForm = ({
  initialData,
  courseId,
  chapterId,
}: LessonsFormProps) => {
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
      await fetch(`/api/courses/${courseId}/chapters/${chapterId}/lessons`, {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success("Lesson created successfully");
      toggleCreating();
      form.reset();
      router.refresh();
    } catch {
      toast.error("Failed to create lesson");
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);
      await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/reorder`,
        {
          method: "PUT",
          body: JSON.stringify({ list: updateData }),
        }
      );
      toast.success("Lessons reordered successfully");
      router.refresh();
    } catch {
      toast.error("Failed to reorder lessons");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/instructor/courses/${courseId}/lessons/${id}`);
  };

  return (
    <Card className="border-0 shadow-lg relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Updating lesson order...</p>
          </div>
        </div>
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Video className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              Chapter Lessons
            </CardTitle>
            <p className="text-sm text-gray-600">
              {initialData.lessons.length} lesson
              {initialData.lessons.length !== 1 ? "s" : ""}
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
              <PlusCircle className="h-4 w-4" /> Add Lesson
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
                        placeholder="e.g., 'Introduction to React Hooks'"
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
                    <Video className="h-4 w-4" />
                  )}
                  Create Lesson
                </Button>
              </div>
            </form>
          </Form>
        )}

        {initialData.lessons.length === 0 && !isCreating ? (
          <div className="text-center py-12">
            <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No lessons yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first lesson to this chapter.
            </p>
            <Button onClick={toggleCreating} className="gap-2">
              <PlusCircle className="h-4 w-4" /> Create First Lesson
            </Button>
          </div>
        ) : (
          <>
            <LessonsList
              onEdit={onEdit}
              onReorder={onReorder}
              items={initialData.lessons || []}
            />
            <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
              <Grip className="h-3 w-3" />
              Drag and drop to reorder lessons
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
