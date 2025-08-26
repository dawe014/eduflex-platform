// File: .../_components/lesson-video-form.tsx
"use client";

import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Lesson } from "@prisma/client";
import { FileUpload } from "@/components/file-upload";
import ReactPlayer from "react-player";

interface LessonVideoFormProps {
  initialData: Lesson;
  courseId: string;
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
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Lesson video updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Lesson video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData.videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a video
            </>
          )}
          {!isEditing && initialData.videoUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit video
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!initialData.videoUrl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <Video className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            {/* Install react-player: npm install react-player */}
            <ReactPlayer
              url={initialData.videoUrl}
              width="100%"
              height="100%"
              controls
            />
          </div>
        ))}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="lessonVideo"
            onChange={(url) => {
              if (url) {
                onSubmit({ videoUrl: url });
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Upload this lesson&apos;s video
          </div>
        </div>
      )}
    </div>
  );
};
