import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function CourseLearnRootPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              duration: true,
              isFree: true,
            },
          },
        },
      },
      instructor: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!course) return notFound();

  const firstChapter = course.chapters[0];
  const firstLesson = firstChapter?.lessons[0];

  if (!firstLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Course Not Ready Yet
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                This course doesn&apos;t have any published lessons yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Please check back later or contact the instructor for more
                information.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/courses/${courseId}`}>
                  <Button variant="outline" className="gap-2">
                    <ArrowRight className="h-4 w-4" />
                    View Course Details
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Browse Other Courses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If there&apos;s a first lesson, redirect to it
  return redirect(`/courses/${courseId}/learn/lessons/${firstLesson.id}`);
}
