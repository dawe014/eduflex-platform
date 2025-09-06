import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Heart, ArrowRight, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CourseCard } from "@/components/courses/course-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  Course,
  Category,
  Review,
  Enrollment,
  Chapter,
  Lesson,
} from "@prisma/client";

type CourseWithFullDetails = Course & {
  category: Category | null;
  reviews: Review[];
  enrollments: Enrollment[];
  chapters: (Chapter & { lessons: Lesson[] })[];
};

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");

  const wishlistItems = await db.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          category: true,
          reviews: true,
          enrollments: true,
          chapters: {
            where: { isPublished: true },
            include: {
              lessons: {
                where: { isPublished: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalWishlisted = wishlistItems.length;
  console.log(wishlistItems);
  const totalPrice = wishlistItems.reduce(
    (sum, item) => sum + (item.course.price || 0),
    0
  );
  const totalRatingsSum = wishlistItems.reduce(
    (sum, item) =>
      sum + item.course.reviews.reduce((acc, r) => acc + r.rating, 0),
    0
  );
  const totalRatingsCount = wishlistItems.reduce(
    (sum, item) => sum + item.course.reviews.length,
    0
  );
  const averageRating =
    totalRatingsCount > 0 ? totalRatingsSum / totalRatingsCount : 0;

  let recommendedCourses: CourseWithFullDetails[] = [];
  if (totalWishlisted > 0) {
    const categoryIds = wishlistItems
      .map((item) => item.course.categoryId)
      .filter((id): id is string => id !== null);

    const wishlistedCourseIds = wishlistItems.map((item) => item.course.id);
    const userEnrollments = await db.enrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true },
    });
    const enrolledCourseIds = userEnrollments.map((e) => e.courseId);
    const excludedCourseIds = [...wishlistedCourseIds, ...enrolledCourseIds];

    if (categoryIds.length > 0) {
      recommendedCourses = (await db.course.findMany({
        where: {
          isPublished: true,
          categoryId: { in: categoryIds },
          id: { notIn: excludedCourseIds },
        },
        include: {
          category: true,
          reviews: true,
          enrollments: true,
          chapters: {
            where: { isPublished: true },
            include: {
              lessons: {
                where: { isPublished: true },
              },
            },
          },
        },
        orderBy: { enrollments: { _count: "desc" } },
        take: 4,
      })) as CourseWithFullDetails[];
    }
  }

  const allWishlistedIds = new Set(wishlistItems.map((item) => item.courseId));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <Heart className="h-8 w-8 text-red-600 fill-red-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-2">
              Courses you&apos;ve saved for later
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {totalWishlisted > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Saved Courses
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalWishlisted}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Value
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${totalPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg. Rating
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {averageRating.toFixed(1)}/5
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wishlist Content */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Saved Courses {totalWishlisted > 0 && `(${totalWishlisted})`}
            </h2>
          </div>
          {wishlistItems.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="text-center py-16">
                <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Your wishlist is empty
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Start exploring courses and save your favorites by clicking
                  the heart icon
                </p>
                <Button
                  asChild
                  className="bg-red-600 hover:bg-red-700 px-8 py-4 text-lg"
                >
                  <Link href="/courses">
                    Explore Courses <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {wishlistItems.map((item) => (
                <CourseCard
                  key={item.id}
                  course={item.course as CourseWithFullDetails}
                  isWishlisted={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recommendations Section */}
        {recommendedCourses.length > 0 && (
          <div className="pt-16 border-t border-gray-200 mt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                You Might Also Like
              </h2>
              <Button variant="ghost" className="text-blue-600" asChild>
                <Link href="/courses">
                  View All <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {recommendedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isWishlisted={allWishlistedIds.has(course.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
