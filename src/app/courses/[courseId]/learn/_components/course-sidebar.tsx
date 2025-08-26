// File: .../_components/course-sidebar.tsx
"use client";

import { Chapter, Course, Lesson } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CourseSidebarProps {
  course: Course & { chapters: (Chapter & { lessons: Lesson[] })[] };
  completedLessonIds: string[];
  progressPercentage: number;
}

export const CourseSidebar = ({
  course,
  completedLessonIds,
  progressPercentage,
}: CourseSidebarProps) => {
  const params = useParams();
  const router = useRouter();

  // Find the chapter that contains the currently active lesson
  const activeChapterId = course.chapters.find((chapter) =>
    chapter.lessons.some((lesson) => lesson.id === params.lessonId)
  )?.id;

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-6 flex flex-col border-b">
        <h1 className="font-semibold text-lg">{course.title}</h1>
        <div className="mt-4">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs mt-2">
            {Math.round(progressPercentage)}% Complete
          </p>
        </div>
      </div>
      <Accordion
        type="single"
        collapsible
        defaultValue={activeChapterId}
        className="w-full"
      >
        {course.chapters.map((chapter) => (
          <AccordionItem value={chapter.id} key={chapter.id}>
            <AccordionTrigger className="px-6 py-4 font-semibold hover:no-underline">
              {chapter.title}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col w-full">
                {chapter.lessons.map((lesson) => {
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const isActive = params.lessonId === lesson.id;
                  const Icon = isCompleted
                    ? CheckCircle
                    : isActive
                    ? PlayCircle
                    : Lock;

                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/${course.id}/learn/lessons/${lesson.id}`}
                      className={cn(
                        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20 py-3",
                        isActive &&
                          "text-slate-700 bg-slate-200/20 hover:text-slate-700 hover:bg-slate-200/20",
                        isCompleted &&
                          "text-emerald-700 hover:text-emerald-700",
                        isCompleted && isActive && "bg-emerald-200/20"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isCompleted && "text-emerald-700"
                        )}
                      />
                      <span className="line-clamp-1">{lesson.title}</span>
                    </Link>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
