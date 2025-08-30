"use client";

import { useState } from "react";
import { Chapter, Lesson } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Lock, PlayCircle, Clock } from "lucide-react"; // Import Clock icon
import { cn } from "@/lib/utils";
import { VideoPlayerModal } from "@/components/courses/video-player-modal";

type ChapterWithLessons = Chapter & {
  lessons: Lesson[];
  // --- NEW: Add pre-calculated duration ---
  totalDuration: string;
};

interface CourseContentAccordionProps {
  chapters: ChapterWithLessons[];
}

export const CourseContentAccordion = ({
  chapters,
}: CourseContentAccordionProps) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const handlePreview = (lesson: Lesson) => {
    if (lesson.isFree && lesson.videoUrl) {
      setSelectedLesson(lesson);
    }
  };

  return (
    <>
      <VideoPlayerModal
        isOpen={!!selectedLesson}
        onClose={() => setSelectedLesson(null)}
        title={selectedLesson?.title || ""}
        videoUrl={selectedLesson?.videoUrl || ""}
      />

      <Accordion type="multiple" className="w-full space-y-3">
        {chapters.map((chapter, chapterIndex) => (
          <AccordionItem
            value={chapter.id}
            key={chapter.id}
            className="border border-gray-200/80 rounded-lg bg-gray-50/50"
          >
            <AccordionTrigger className="font-semibold text-lg hover:no-underline px-4 py-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">
                      {chapterIndex + 1}
                    </span>
                  </div>
                  <span className="text-left">{chapter.title}</span>
                </div>
                {/* --- NEW: Display Chapter Duration --- */}
                <div className="flex items-center gap-x-2 text-sm text-gray-500 font-normal pr-2">
                  <span>{chapter.lessons.length} lessons</span>
                  <span className="text-xs">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {chapter.totalDuration}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="border-t border-gray-200/80">
              <div className="space-y-1 py-2">
                {/* ... (Lesson mapping logic remains the same) ... */}
                {chapter.lessons.map((lesson) => {
                  const isPreviewable = lesson.isFree && lesson.videoUrl;
                  const Icon = isPreviewable ? PlayCircle : Lock;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handlePreview(lesson)}
                      className={cn(
                        "flex items-center gap-3 p-3 mx-2 rounded-md transition",
                        isPreviewable && "cursor-pointer hover:bg-slate-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isPreviewable ? "text-blue-600" : "text-gray-400"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm flex-1",
                          !isPreviewable && "text-gray-500"
                        )}
                      >
                        {lesson.title}
                      </span>
                      {isPreviewable ? (
                        <span className="ml-auto text-sm font-medium text-blue-600 border border-blue-200 bg-blue-50 px-2 py-1 rounded">
                          Preview {lesson.duration || "0:00"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {lesson.duration || "0:00"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
};
