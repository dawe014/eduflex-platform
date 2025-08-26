"use client";

import { Lesson } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Grip, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LessonsListProps {
  items: Lesson[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export const LessonsList = ({ items, onReorder, onEdit }: LessonsListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [lessons, setLessons] = useState(items);

  // Prevent hydration errors with drag-and-drop libraries
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync state with props if they change
  useEffect(() => {
    setLessons(items);
  }, [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    // Create a new, reordered array
    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the UI optimistically
    setLessons(items);

    // Prepare data for the API call
    const bulkUpdateData = items.map((lesson, index) => ({
      id: lesson.id,
      position: index + 1,
    }));

    onReorder(bulkUpdateData);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lessons">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {lessons.map((lesson, index) => (
              <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                      lesson.isPublished &&
                        "bg-sky-100 border-sky-200 text-sky-700"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
                        lesson.isPublished &&
                          "border-r-sky-200 hover:bg-sky-200"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {lesson.title}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      {lesson.isFree && <Badge>Free</Badge>}
                      <Badge
                        className={cn(
                          "bg-slate-500",
                          lesson.isPublished && "bg-sky-700"
                        )}
                      >
                        {lesson.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(lesson.id)}
                        className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
