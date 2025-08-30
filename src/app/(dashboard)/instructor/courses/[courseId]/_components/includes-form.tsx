"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, ListChecks } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Course } from "@prisma/client";
import { DynamicInputList } from "@/components/dynamic-input-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IncludesFormProps {
  initialData: Course;
  courseId: string;
}

const formSchema = z.object({
  includes: z
    .array(z.string().min(1, "Item cannot be empty."))
    .min(1, "At least one item is required."),
});

export const IncludesForm = ({ initialData, courseId }: IncludesFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { includes: initialData?.includes || [] },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Course includes updated successfully");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Failed to update course includes");
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ListChecks className="h-5 w-5 text-blue-600" />
          </div>
          <CardTitle className="text-lg font-semibold">
            This course includes
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
              Edit Includes
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="prose prose-sm max-w-none">
            {initialData.includes.length === 0 ? (
              <p className="text-gray-500 italic">No items added yet.</p>
            ) : (
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                {initialData.includes.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              <DynamicInputList
                items={form.watch("includes")}
                setItems={(items) =>
                  form.setValue("includes", items, { shouldValidate: true })
                }
                placeholder="e.g., 12+ hours of on-demand video"
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
