import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, BookOpen } from "lucide-react";

const CourseIdLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      {/* Hero Section Skeleton */}
      <div className="bg-gray-200 animate-pulse">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="lg:w-2/3 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-12 w-full max-w-2xl" />
              <Skeleton className="h-8 w-full max-w-3xl" />
              <div className="flex flex-wrap gap-6 mb-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </div>
            <div className="lg:w-1/3 w-full">
              <Skeleton className="aspect-video rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            {/* "What you'll learn" Skeleton */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-gray-300" />
                  <Skeleton className="h-7 w-52" />
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>

            {/* "Course Content" Skeleton */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-gray-300" />
                  <Skeleton className="h-7 w-48" />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <Card className="sticky top-24 border-0 shadow-xl">
              <CardHeader className="bg-gray-200 h-24 rounded-t-lg animate-pulse" />
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-6 w-40" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-5/6" />
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseIdLoading;
