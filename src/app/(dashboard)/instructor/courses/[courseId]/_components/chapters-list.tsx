"use client";

import { Chapter } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import {
  Grip,
  Pencil,
  BookOpen,
  Clock,
  Eye,
  EyeOff,
  Crown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChaptersListProps {
  items: Chapter[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export const ChaptersList = ({
  items,
  onReorder,
  onEdit,
}: ChaptersListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chapters, setChapters] = useState(items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setChapters(items);
  }, [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(chapters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setChapters(items);

    const bulkUpdateData = items.map((chapter, index) => ({
      id: chapter.id,
      position: index + 1,
    }));

    onReorder(bulkUpdateData);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chapters">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn(
              "space-y-3",
              snapshot.isDraggingOver && "bg-blue-50 rounded-lg p-2"
            )}
          >
            {chapters.map((chapter, index) => (
              <Draggable
                key={chapter.id}
                draggableId={chapter.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <Card
                    className={cn(
                      "border-0 transition-all duration-200",
                      snapshot.isDragging && "shadow-lg ring-2 ring-blue-500",
                      chapter.isPublished
                        ? "bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg cursor-grab active:cursor-grabbing transition-colors",
                            chapter.isPublished
                              ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          )}
                          {...provided.dragHandleProps}
                        >
                          <Grip className="h-4 w-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {chapter.title || "Untitled Chapter"}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              Position {chapter.position}
                            </span>
                            <BookOpen className="h-3 w-3 text-gray-400" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {chapter.isFree && (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200"
                            >
                              <Crown className="h-3 w-3 mr-1" />
                              Free
                            </Badge>
                          )}

                          <Badge
                            variant={
                              chapter.isPublished ? "default" : "secondary"
                            }
                            className={cn(
                              "px-2 py-1 text-xs",
                              chapter.isPublished
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            )}
                          >
                            {chapter.isPublished ? (
                              <Eye className="h-3 w-3 mr-1" />
                            ) : (
                              <EyeOff className="h-3 w-3 mr-1" />
                            )}
                            {chapter.isPublished ? "Published" : "Draft"}
                          </Badge>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(chapter.id)}
                            className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
