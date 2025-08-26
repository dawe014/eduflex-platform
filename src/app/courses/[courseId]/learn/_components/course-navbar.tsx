// File: .../_components/course-navbar.tsx
import { Chapter, Course, Lesson } from "@prisma/client";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CourseSidebar } from "./course-sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CourseNavbarProps {
  course: Course & { chapters: (Chapter & { lessons: Lesson[] })[] };
  completedLessonIds: string[];
  progressPercentage: number;
}

export const CourseNavbar = ({
  course,
  completedLessonIds,
  progressPercentage,
}: CourseNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-white w-72">
            <CourseSidebar
              course={course}
              completedLessonIds={completedLessonIds}
              progressPercentage={progressPercentage}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Course Title (linked back to course page) */}
      <Link href={`/courses/${course.id}`}>
        <h1 className="text-lg font-semibold hover:underline line-clamp-1">
          {course.title}
        </h1>
      </Link>

      {/* Add UserButton or other actions to the right if needed */}
      <div className="ml-auto">{/* e.g., <UserButton /> */}</div>
    </div>
  );
};
