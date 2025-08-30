"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "./wishlist-button";
import { Course, Category, Review, Enrollment, Lesson } from "@prisma/client";
import { calculateTotalCourseDuration } from "@/lib/duration-helper";

// ✅ Updated type to include chapters with lessons
type CourseWithDetails = Course & {
  category: Category | null;
  reviews: Review[];
  enrollments: Enrollment[];
  chapters: { lessons: Lesson[] }[];
};

interface CourseCardProps {
  course: CourseWithDetails;
  isWishlisted: boolean;
}

export const CourseCard = ({ course, isWishlisted }: CourseCardProps) => {
  const { id, title, imageUrl, category, price, reviews, enrollments } = course;
  const destination = `/courses/${id}`;

  // ✅ Dynamic calculations
  const students = enrollments.length;
  const rating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  // ✅ NEW: Calculate lessons and duration dynamically
  const lessons = course.chapters.reduce(
    (sum, chapter) => sum + chapter.lessons.length,
    0
  );
  const duration = calculateTotalCourseDuration(course.chapters); // Returns formatted string like "2h 45m"

  const handleActionClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl border-0 group/card">
      <Link href={destination} className="flex flex-col flex-grow">
        {/* ✅ Course Image with Category Badge and Wishlist */}
        <CardHeader className="p-0 relative">
          <div className="relative w-full aspect-video overflow-hidden">
            <Image
              src={imageUrl || "/images/placeholder.jpg"}
              alt={title}
              fill
              className="object-cover group-hover/card:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/90 text-gray-800 hover:bg-white border-0 font-medium px-3 py-1">
                {category?.name || "Uncategorized"}
              </Badge>
            </div>
            <div
              className="absolute bottom-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
              onClick={handleActionClick}
            >
              <WishlistButton courseId={id} isWishlisted={isWishlisted} />
            </div>
          </div>
        </CardHeader>

        {/* ✅ Course Details */}
        <CardContent className="p-5 flex-grow">
          <CardTitle className="line-clamp-2 text-lg font-semibold text-gray-900 group-hover/card:text-blue-600 transition-colors duration-300 mb-3">
            {title}
          </CardTitle>

          {/* ✅ Rating & Students */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(rating) ? "fill-current" : ""
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-700">
                {rating.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-600">
                {students.toLocaleString()} students
              </span>
            </div>
          </div>

          {/* ✅ Lessons and Duration */}
          <div className="flex items-center gap-4 text-xs text-gray-500 border-t pt-3 mt-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{lessons} lessons</span>
            </div>
          </div>
        </CardContent>
      </Link>

      {/* ✅ Price & Action Button */}
      <CardFooter className="p-5 pt-0 flex justify-between items-center mt-auto">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-900">
            {price !== null ? `$${price.toFixed(2)}` : "Free"}
          </span>
          {price !== null && price > 5 && (
            <span className="text-sm text-gray-500 ml-2 line-through opacity-70">
              ${(price * 1.5).toFixed(2)}
            </span>
          )}
        </div>
        <Button
          asChild
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
        >
          <Link href={destination}>
            View Course <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
