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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Hourglass } from "lucide-react"; // Using Hourglass icon
import { useState } from "react";
import { toast } from "sonner";
import { Lesson } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LessonDurationFormProps {
  initialData: Lesson;
  courseId: string;
  lessonId: string;
}

const formSchema = z.object({
  duration: z
    .string()
    .min(1, { message: "Duration is required" })
    .regex(/^\d{1,2}:\d{2}$/, {
      message: "Duration must be in HH:MM or H:MM format (e.g., 05:30 or 5:30)",
    }), // Added regex for time format validation
});

export const LessonDurationForm = ({
  initialData,
  courseId,
  lessonId,
}: LessonDurationFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { duration: initialData.duration || "" },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" }, // Ensure headers are set for PATCH
      });
      toast.success("Lesson duration updated successfully");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Failed to update lesson duration");
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Hourglass className="h-5 w-5 text-indigo-600" />
          </div>
          <CardTitle className="text-lg font-semibold">
            Lesson Duration
          </CardTitle>
        </div>
        <Button
          onClick={toggleEdit}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              Edit Duration
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="prose prose-sm max-w-none">
            {initialData.duration ? (
              <p className="text-gray-700 leading-relaxed">
                {initialData.duration} minutes
              </p> // Added "minutes" for clarity, adjust as needed
            ) : (
              <p className="text-gray-500 italic">No duration set</p>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g., '10:30' (MM:SS)" // Clarified placeholder
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
                  <Check className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={toggleEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};
