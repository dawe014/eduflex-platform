"use client";

import { Chapter, Course, Lesson, Review } from "@prisma/client";
import { Menu, BookOpen, ChevronLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CourseSidebar } from "./course-sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type CourseWithDetails = Course & {
  chapters: (Chapter & { lessons: Lesson[] })[];
  instructor: { name: string; image?: string | null };
};

interface CourseNavbarProps {
  course: CourseWithDetails;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  existingReview: Review | null;
}

export const CourseNavbar = ({
  course,
  completedLessons,
  totalLessons,
  progressPercentage,
  existingReview,
}: CourseNavbarProps) => {
  const completedLessonIds = new Set<string>();

  return (
    <div className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 h-20 px-4 sm:px-6">
      <div className="flex items-center h-full gap-4">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <CourseSidebar
                course={course}
                completedLessonIds={new Set()}
                progressPercentage={progressPercentage}
                existingReview={existingReview}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg hidden sm:flex"
          asChild
        >
          <Link href={`/courses/${course.id}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>

        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/courses/${course.id}`}>
            <h1 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
              {course.title}
            </h1>
          </Link>
          <p className="text-sm text-gray-600 line-clamp-1">
            by {course.instructor.name}
          </p>
        </div>

        {/* Progress Display - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}% Complete
            </div>
            <div className="text-xs text-gray-500">
              {completedLessons}/{totalLessons} lessons
            </div>
          </div>
          <div className="w-32">
            <Progress value={progressPercentage} className="h-2 bg-gray-200" />
          </div>
        </div>

        {/* Course Icon */}
        <div className="hidden sm:flex p-2 bg-blue-100 rounded-lg">
          <BookOpen className="h-5 w-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
};
