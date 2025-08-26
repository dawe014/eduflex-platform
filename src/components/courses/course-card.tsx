// File: src/components/courses/course-card.tsx
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
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Eye,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the props for our component based on the Prisma schema
interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string | null;
  category: string | null;
  price: number | null;
  instructor?: string;
  rating?: number;
  students?: number;
  duration?: string;
  lessons?: number;
  href?: string;
  isFeatured?: boolean;
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  category,
  price,
  instructor = "Expert Instructor",
  rating = 4.5,
  students = 0,
  duration = "0h 0m",
  lessons = 0,
  href,
  isFeatured = false,
}: CourseCardProps) => {
  const destination = href || `/courses/${id}`;

  return (
    <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl border-0 group/card">
      <Link href={destination}>
        <CardHeader className="p-0 relative">
          <div className="relative w-full aspect-video overflow-hidden">
            <Image
              src={imageUrl || "/images/placeholder.jpg"}
              alt={title}
              fill
              className="object-cover group-hover/card:scale-105 transition-transform duration-300"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/90 text-gray-800 hover:bg-white border-0 font-medium px-3 py-1">
                {category || "Uncategorized"}
              </Badge>
            </div>

            {/* Featured badge */}
            {isFeatured && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 font-medium px-3 py-1">
                  Featured
                </Badge>
              </div>
            )}

            {/* Quick actions overlay */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <CardTitle className="line-clamp-2 text-lg font-semibold text-gray-900 group-hover/card:text-blue-600 transition-colors duration-300 mb-3">
            {title}
          </CardTitle>

          {/* Instructor */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <span className="truncate">By {instructor}</span>
          </div>

          {/* Rating and students */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(rating) ? "fill-current" : ""
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-700">
                {rating}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600">
                {students.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Course metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{lessons} lessons</span>
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-5 pt-0 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-900">
            {price !== null ? `$${price.toFixed(2)}` : "Free"}
          </span>
          {price !== null && price > 0 && (
            <span className="text-sm text-gray-500 ml-1 line-through opacity-70">
              $99.99
            </span>
          )}
        </div>

        <Button
          asChild
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Link href={destination}>
            Enroll Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
