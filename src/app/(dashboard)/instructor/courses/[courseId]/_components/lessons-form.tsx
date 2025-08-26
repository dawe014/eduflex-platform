// File: src/app/(dashboard)/instructor/courses/[courseId]/_components/lessons-form.tsx
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
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Course, Lesson } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { LessonsList } from "./lessons-list";

interface LessonsFormProps {
  initialData: Course & { lessons: Lesson[] };
  courseId: string;
}

const formSchema = z.object({
  title: z.string().min(1),
});

export const LessonsForm = ({ initialData, courseId }: LessonsFormProps) => {
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
      await fetch(`/api/courses/${courseId}/lessons`, {
        method: "POST",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Lesson created");
      toggleCreating();
      form.reset();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  // We'll implement reordering later
  const onReorder = () => {
    toast.info("Reordering coming soon!");
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course lessons
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
                      placeholder="e.g. 'Introduction to the course'"
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
          <div className="text-sm mt-2">
            Drag and drop to reorder the lessons
          </div>
          <LessonsList
            onEdit={() => {}} // Placeholder for edit modal
            onReorder={onReorder}
            items={initialData.lessons || []}
          />
        </>
      )}
    </div>
  );
};
