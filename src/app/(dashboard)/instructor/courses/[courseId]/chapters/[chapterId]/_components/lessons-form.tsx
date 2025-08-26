// File: src/app/(dashboard)/instructor/courses/[courseId]/chapters/[chapterId]/_components/lessons-form.tsx
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
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Chapter, Lesson } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LessonsList } from "./lessons-list"; // We will create this

interface LessonsFormProps {
  initialData: Chapter & { lessons: Lesson[] };
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({ title: z.string().min(1) });

export const LessonsForm = ({
  initialData,
  courseId,
  chapterId,
}: LessonsFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const toggleCreating = () => setIsCreating((current) => !current);

  const form = useForm({
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
      toast.success("Lesson created");
      toggleCreating();
      form.reset();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
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
      toast.success("Lessons reordered");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/instructor/courses/${courseId}/lessons/${id}`);
  };

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between">
        Chapter lessons
        <Button onClick={toggleCreating} variant="ghost">
          {isCreating ? (
            "Cancel"
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a lesson
            </>
          )}
        </Button>
      </div>
      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g., 'Introduction to...'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={!isValid || isSubmitting} type="submit">
              Create
            </Button>
          </form>
        </Form>
      )}
      {!isCreating && (
        <>
          <div
            className={cn(
              "text-sm mt-2",
              !initialData.lessons.length && "text-slate-500 italic"
            )}
          >
            {!initialData.lessons.length && "No lessons"}
            <LessonsList
              onEdit={onEdit}
              onReorder={onReorder}
              items={initialData.lessons || []}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Drag and drop to reorder lessons
          </p>
        </>
      )}
    </div>
  );
};
