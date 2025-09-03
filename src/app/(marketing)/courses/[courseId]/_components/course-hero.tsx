"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Users, BookOpen, Calendar, Award, Play } from "lucide-react";
import { VideoPlayerModal } from "@/components/courses/video-player-modal";
import { Course, Category, Review, Enrollment } from "@prisma/client";

type CourseHeroProps = {
  course: Course & {
    category: Category | null;
    reviews: Review[];
    enrollments: Enrollment[];
    instructor: { name: string | null; image: string | null };
  };
  totalLessons: number;
  averageRating: number;
  previewLesson: { title: string; videoUrl: string } | null;
};

export const CourseHero = ({
  course,
  totalLessons,
  averageRating,
  previewLesson,
}: CourseHeroProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const studentCount = course.enrollments.length;
  const reviewCount = course.reviews.length;

  return (
    <>
      {previewLesson && (
        <VideoPlayerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={previewLesson.title}
          videoUrl={previewLesson.videoUrl}
        />
      )}

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="lg:w-2/3">
              <Badge className="bg-white/20 text-white border-0 mb-4 hover:bg-white/30">
                {course.category?.name || "Uncategorized"}
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
                  <span className="font-semibold">
                    {averageRating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-200" />
                  <span>{studentCount.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-200" />
                  <span>{totalLessons} lessons</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white/50">
                    <AvatarImage src={course.instructor?.image || ""} />
                    <AvatarFallback>
                      {course.instructor?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
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
                    <p className="font-semibold">
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/3 w-full">
              <div
                onClick={() => previewLesson && setIsModalOpen(true)}
                className="relative aspect-video rounded-xl overflow-hidden shadow-2xl group"
              >
                <Image
                  src={course.imageUrl || "/images/placeholder.jpg"}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/50" />

                {previewLesson && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                      <Play className="h-8 w-8 text-blue-600 fill-current" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
