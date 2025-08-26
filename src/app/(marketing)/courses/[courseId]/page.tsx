// File: src/app/courses/[courseId]/page.tsx
import { db } from "@/lib/db";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnrollButton } from "@/components/courses/enroll-button";
import { Reviews } from "@/components/courses/reviews";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  CheckCircle,
  Play,
  FileText,
  Download,
  Calendar,
  ArrowRight,
  Shield,
  Heart,
} from "lucide-react";

interface CourseIdPageProps {
  params: {
    courseId: string;
  };
}

export default async function CourseIdPage({ params }: CourseIdPageProps) {
  const { courseId } = await params;
  const course = await db.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    include: {
      reviews: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
      instructor: {
        select: {
          name: true,
          image: true,
          bio: true,
        },
      },
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
        include: {
          lessons: {
            where: {
              isPublished: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      },
    },
  });

  if (!course) {
    return notFound();
  }

  const totalLessons = course.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0
  );
  const totalDuration = "12h 30m"; // This would be calculated from lesson durations

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="lg:w-2/3">
              <Badge className="bg-white/20 text-white border-0 mb-4 hover:bg-white/30">
                {course.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-blue-100 text-lg mb-6 max-w-3xl">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400 fill-current" />
                  <span className="font-semibold">4.8 (1,234 reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-200" />
                  <span>5,678 students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-200" />
                  <span>{totalDuration} total</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Created by</p>
                    <p className="font-semibold">
                      {course.instructor?.name || "Expert Instructor"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Last updated</p>
                    <p className="font-semibold">December 2024</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/3 w-full">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={course.imageUrl || "/images/placeholder.jpg"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="bg-white p-4 rounded-full">
                    <Play className="h-8 w-8 text-blue-600 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  What you'll learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Master advanced programming concepts",
                    "Build real-world applications",
                    "Debug and optimize your code",
                    "Deploy applications to production",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  Course Content
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    {course.chapters.length} chapters • {totalLessons} lessons
                  </span>
                  <span>{totalDuration} total length</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course.chapters.map((chapter, index) => (
                    <div key={chapter.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">
                          {index + 1}. {chapter.title}
                        </h3>
                        <span className="text-sm text-gray-600">
                          {chapter.lessons.length} lessons • 45m
                        </span>
                      </div>
                      <div className="space-y-2">
                        {chapter.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 p-2 hover:bg-white rounded"
                          >
                            <Play className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {index + 1}.{lessonIndex + 1} {lesson.title}
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">
                              10m
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  Instructor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {course.instructor?.name || "Expert Instructor"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {course.instructor?.bio ||
                        "Seasoned professional with years of industry experience."}
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-400 fill-current" />
                        <span>4.8 Instructor Rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>12,345 Students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span>8 Courses</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Reviews reviews={course.reviews} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-24 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl">
                  {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                </CardTitle>
                <p className="text-blue-100">
                  One-time payment, lifetime access
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <EnrollButton courseId={course.id} />

                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    This course includes:
                  </h4>
                  <div className="space-y-2">
                    {[
                      { icon: Clock, text: `${totalDuration} on-demand video` },
                      { icon: Download, text: "Downloadable resources" },
                      { icon: FileText, text: "Certificate of completion" },
                      { icon: Shield, text: "Full lifetime access" },
                      { icon: Heart, text: "30-day money-back guarantee" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button variant="outline" className="w-full" asChild>
                  <a href="#">
                    <Heart className="h-4 w-4 mr-2" />
                    Gift this course
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
