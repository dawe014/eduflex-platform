"use client";

import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, Video, X, Upload, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Lesson } from "@prisma/client";
import { FileUpload } from "@/components/file-upload";
import ReactPlayer from "react-player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface LessonVideoFormProps {
  initialData: Lesson;
  courseId: string;
  chapterId: string;
  lessonId: string;
}

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

export const LessonVideoForm = ({
  initialData,
  courseId,
  lessonId,
}: LessonVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUploading(true);
      await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Lesson video updated successfully");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Failed to update video");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Video className="h-5 w-5 text-blue-600" />
          </div>
          <CardTitle className="text-lg font-semibold">Video Content</CardTitle>
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
          ) : initialData.videoUrl ? (
            <>
              <Pencil className="h-4 w-4" />
              Edit Video
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4" />
              Add Video
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          !initialData.videoUrl ? (
            <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Video className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-sm mb-2">No video uploaded</p>
              <Button onClick={toggleEdit} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <ReactPlayer
                  src={initialData.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                  light={true}
                  playIcon={
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <Play className="h-12 w-12 text-white fill-current" />
                      </div>
                    </div>
                  }
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Video ready for students</span>
                <Button variant="outline" size="sm" onClick={toggleEdit}>
                  Replace Video
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-gray-500 text-center">
                  Uploading video... {uploadProgress}%
                </p>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <FileUpload
                endpoint="lessonVideo"
                onChange={(url) => {
                  if (url) {
                    onSubmit({ videoUrl: url });
                  }
                }}
                onUploadProgress={(progress) => setUploadProgress(progress)}
                onUploadStart={() => {
                  setIsUploading(true);
                  setUploadProgress(0);
                }}
                onUploadEnd={() => {
                  setIsUploading(false);
                  setUploadProgress(100);
                }}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">
                Video Requirements
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Supported formats: MP4, WebM, MOV</li>
                <li>• Maximum file size: 1GB</li>
                <li>• Recommended resolution: 1080p or 720p</li>
                <li>• Aspect ratio: 16:9 (landscape)</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
