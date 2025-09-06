"use client";

import { Chapter, Course, Lesson, Review } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { useParams } from "next/navigation";
import { CheckCircle, Lock, PlayCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReviewModal } from "./review-modal";

type CourseWithDetails = Course & {
  chapters: (Chapter & { lessons: Lesson[] })[];
  instructor: { name: string; image?: string | null };
};

interface CourseSidebarProps {
  course: CourseWithDetails;
  completedLessonIds: Set<string>;
  progressPercentage: number;
  existingReview: Review | null;
}

export const CourseSidebar = ({
  course,
  completedLessonIds,
  progressPercentage,
  existingReview,
}: CourseSidebarProps) => {
  const params = useParams();
  const totalLessons = course.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length,
    0
  );

  const activeChapterId = course.chapters.find((chapter) =>
    chapter.lessons.some((lesson) => lesson.id === params.lessonId)
  )?.id;

  return (
    <div className="h-full flex flex-col bg-white/95 backdrop-blur-sm border-r border-gray-200/50 overflow-y-auto">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="space-y-4">
          <div>
            <h1 className="font-bold text-xl text-gray-900 line-clamp-2">
              {course.title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              by {course.instructor.name}
            </p>
          </div>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2 bg-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {completedLessonIds.size} of {totalLessons} lessons completed
              </span>
              <span className="text-sm font-bold text-blue-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
          <ReviewModal courseId={course.id} existingReview={existingReview} />
        </div>
      </div>

      {/* Chapters & Lessons */}
      <div className="flex-1 p-4">
        <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center mb-4 px-2">
          <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
          Course Content
        </h3>
        <Accordion
          type="single"
          collapsible
          defaultValue={activeChapterId}
          className="w-full space-y-2"
        >
          {course.chapters.map((chapter) => (
            <AccordionItem
              value={chapter.id}
              key={chapter.id}
              className="border border-gray-200/50 rounded-lg overflow-hidden bg-white"
            >
              <AccordionTrigger className="font-medium text-gray-900 text-left px-4 py-3 hover:no-underline hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">
                      {chapter.position}
                    </span>
                  </div>
                  <span className="flex-1 text-left">{chapter.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t border-gray-200/50">
                {chapter.lessons.map((lesson) => {
                  const isCompleted = completedLessonIds.has(lesson.id);
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
                        "flex items-center gap-x-3 p-3 text-sm transition-all hover:bg-blue-50/50 border-l-4 border-transparent",
                        isActive &&
                          "bg-blue-50 border-l-4 border-blue-600 font-semibold",
                        isCompleted && "text-emerald-700",
                        isCompleted &&
                          isActive &&
                          "bg-emerald-50 border-l-4 border-emerald-600"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          isCompleted && "text-emerald-600",
                          isActive && !isCompleted && "text-blue-600"
                        )}
                      />
                      <span className="flex-1 text-left line-clamp-2">
                        {lesson.position}. {lesson.title}
                      </span>
                    </Link>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Footer Section */}
      <div className="mt-auto p-4 border-t border-gray-200/50 bg-gray-50">
        <div className="text-center text-xs text-gray-500">
          {completedLessonIds.size === totalLessons ? (
            <div className="flex items-center justify-center text-emerald-600 font-medium">
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Course Completed!
            </div>
          ) : (
            `Keep going! ${
              totalLessons - completedLessonIds.size
            } lessons remaining`
          )}
        </div>
      </div>
    </div>
  );
};
