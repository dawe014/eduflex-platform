import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface EnrolledCourseCardProps {
  course: {
    id: string;
    title: string;
    imageUrl: string | null;
  };
  progress: number;
}

export const EnrolledCourseCard = ({
  course,
  progress,
}: EnrolledCourseCardProps) => {
  return (
    <Link href={`/courses/${course.id}/learn`}>
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 group">
        <CardHeader className="p-0 relative">
          <div className="relative w-full aspect-video">
            <Image
              src={course.imageUrl || "/images/placeholder.jpg"}
              alt={course.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(progress)}% Complete
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
