"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageIcon, Pencil, PlusCircle, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Course } from "@prisma/client";
import Image from "next/image";
import { FileUpload } from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImageFormProps {
  initialData: Course;
  courseId: string;
}

export const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: { imageUrl: string }) => {
    try {
      setIsUploading(true);
      await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Course image updated successfully");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Failed to update image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ImageIcon className="h-5 w-5 text-purple-600" />
          </div>
          <CardTitle className="text-lg font-semibold">Course Image</CardTitle>
        </div>
        <Button
          onClick={toggleEdit}
          variant="ghost"
          size="sm"
          className="gap-2"
          disabled={isUploading}
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : initialData.imageUrl ? (
            <>
              <Pencil className="h-4 w-4" />
              Change Image
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4" />
              Add Image
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          !initialData.imageUrl ? (
            <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-sm mb-2">No image uploaded</p>
              <Button onClick={toggleEdit} variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <Image
                  alt="Course image"
                  fill
                  className="object-cover"
                  src={initialData.imageUrl}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Image ready for display</span>
                <Button variant="outline" size="sm" onClick={toggleEdit}>
                  Change Image
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {isUploading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Uploading image...</p>
              </div>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <FileUpload
                endpoint="courseImage"
                onChange={(url) => {
                  if (url) {
                    onSubmit({ imageUrl: url });
                  }
                }}
                onUploadStart={() => setIsUploading(true)}
                onUploadEnd={() => setIsUploading(false)}
              />
            </div>
            <p className="text-xs text-gray-500">
              16:9 aspect ratio recommended • Max size: 4MB
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
