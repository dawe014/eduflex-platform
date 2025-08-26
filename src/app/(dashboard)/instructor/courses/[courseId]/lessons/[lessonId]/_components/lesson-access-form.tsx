// File: .../_components/lesson-access-form.tsx
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Crown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Lesson } from "@prisma/client";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LessonAccessFormProps {
  initialData: Lesson;
  courseId: string;
  chapterId: string;
  lessonId: string;
}

const formSchema = z.object({
  isFree: z.boolean().default(false),
});

export const LessonAccessForm = ({
  initialData,
  courseId,
  chapterId,
  lessonId,
}: LessonAccessFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { isFree: !!initialData.isFree },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      toast.success("Lesson access updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Crown className="h-5 w-5 text-amber-600" />
          </div>
          <CardTitle className="text-lg font-semibold">
            Access Settings
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
              Edit Access
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-2">
            <Badge variant={initialData.isFree ? "success" : "secondary"}>
              {initialData.isFree ? "Free Preview" : "Premium Content"}
            </Badge>
            <p className="text-sm text-gray-600">
              {initialData.isFree
                ? "This lesson is available as a free preview for all visitors."
                : "This lesson requires course enrollment to access."}
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gray-50">
                    <div className="space-y-0.5">
                      <FormDescription className="text-base font-medium">
                        Free Preview
                      </FormDescription>
                      <FormDescription className="text-sm">
                        Enable free preview to allow anyone to watch this lesson
                        without enrollment
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
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
