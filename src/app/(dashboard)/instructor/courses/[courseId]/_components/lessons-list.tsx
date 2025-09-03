"use client";

import { Lesson } from "@prisma/client";
import { Grip, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface LessonsListProps {
  items: Lesson[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export const LessonsList = ({ items, onReorder, onEdit }: LessonsListProps) => {
  return (
    <div>
      {items.map((lesson, index) => (
        <div
          key={lesson.id}
          className="flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm"
        >
          <div className="px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition">
            <Grip className="h-5 w-5" />
          </div>
          {lesson.title}
          <div className="ml-auto pr-2 flex items-center gap-x-2">
            {lesson.isFree && <Badge>Free</Badge>}
            <Link
              href={`/instructor/courses/${lesson.chapterId}/lessons/${lesson.id}`}
            >
              <Pencil className="w-4 h-4 cursor-pointer hover:opacity-75 transition" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};
