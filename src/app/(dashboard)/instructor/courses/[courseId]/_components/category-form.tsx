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
import { Pencil, Check, X, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Course } from "@prisma/client";
import { ComboboxDemo } from "@/components/ui/combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CategoryFormProps {
  initialData: Course;
  courseId: string;
  options: { label: string; value: string }[];
}

const formSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
});

export const CategoryForm = ({
  initialData,
  courseId,
  options,
}: CategoryFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { categoryId: initialData?.categoryId || "" },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Course category updated successfully");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Failed to update category");
    }
  };

  const selectedOption = options.find(
    (option) => option.value === initialData.categoryId
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Tag className="h-5 w-5 text-pink-600" />
          </div>
          <CardTitle className="text-lg font-semibold">
            Course Category
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
              Edit Category
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-2">
            {selectedOption ? (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {selectedOption.label}
              </Badge>
            ) : (
              <p className="text-gray-500 italic">No category selected</p>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ComboboxDemo
                        options={options}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a category..."
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
                  Save Category
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
