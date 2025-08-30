import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CourseCard } from "@/components/courses/course-card";
import { CourseFilters } from "./_components/course-filters";
import {
  BookOpen,
  Search,
  Star,
  Users,
  TrendingUp,
  ArrowRight,
  X,
} from "lucide-react";
import { HeroSlider } from "@/components/layout/hero-slider";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BrowseCoursesPageProps {
  searchParams: {
    search?: string;
    categoryId?: string;
  };
}

export default async function BrowseCoursesPage({
  searchParams,
}: BrowseCoursesPageProps) {
  const session = await getServerSession(authOptions);
  const { search, categoryId } = await searchParams;
  const searchTerm = search || "";

  const whereClause: any = {
    isPublished: true,
    ...(searchTerm && {
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
    }),
    ...(categoryId && categoryId !== "all" && { categoryId }),
  };

  const courses = await db.course.findMany({
    where: whereClause,
    include: {
      category: true,
      reviews: true,
      enrollments: true,
      instructor: {
        select: {
          name: true,
          image: true,
        },
      },
      chapters: {
        where: { isPublished: true },
        include: {
          lessons: {
            where: { isPublished: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { courses: { where: { isPublished: true } } } },
    },
  });

  const userWishlist = session?.user
    ? await db.wishlist.findMany({
        where: { userId: session.user.id },
        select: { courseId: true },
      })
    : [];
  const wishlistedCourseIds = new Set(
    userWishlist.map((item) => item.courseId)
  );

  const totalCourses = await db.course.count({ where: { isPublished: true } });
  const totalEnrollments = await db.enrollment.count();

  // Clear filters component
  const ClearFiltersButton = () => (
    <Button
      asChild
      variant="outline"
      className="border-blue-300 text-blue-600 hover:bg-blue-50"
    >
      <Link href="/courses">
        <X className="h-4 w-4 mr-2" />
        Clear Filters
      </Link>
    </Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <HeroSlider />

      {/* Stats Bar */}
      <div className="relative z-10 -mt-16 md:-mt-20 lg:-mt-24 container mx-auto px-4 md:px-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 flex flex-wrap justify-around items-center gap-6 border border-white/20">
          <div className="flex items-center gap-4 text-gray-800">
            <div className="p-3 bg-blue-100 rounded-xl">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {totalCourses.toLocaleString()}+
              </span>
              <p className="text-sm text-gray-600 mt-1">Courses</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-gray-200"></div>

          <div className="flex items-center gap-4 text-gray-800">
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {totalEnrollments.toLocaleString()}+
              </span>
              <p className="text-sm text-gray-600 mt-1">Students</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-gray-200"></div>

          <div className="flex items-center gap-4 text-gray-800">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Star className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">4.8/5</span>
              <p className="text-sm text-gray-600 mt-1">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16">
        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 border border-gray-100">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                Find Your Perfect Course
              </h2>
              <p className="text-gray-600 text-lg">
                Discover courses that match your interests and goals
              </p>
            </div>

            {(searchTerm || (categoryId && categoryId !== "all")) && (
              <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl">
                <Search className="h-5 w-5 text-blue-600" />
                <span className="text-blue-700 font-medium">
                  {searchTerm
                    ? `Search: "${searchTerm}"`
                    : "Filtered by category"}
                </span>
                <ClearFiltersButton />
              </div>
            )}
          </div>

          <CourseFilters categories={categories} />
        </div>

        {/* Courses Grid */}
        <div className="space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold text-gray-900">
              {searchTerm || (categoryId && categoryId !== "all")
                ? "Search Results"
                : "Featured Courses"}
              <span className="text-blue-600 ml-3">({courses.length})</span>
            </h2>

            {!searchTerm && !categoryId && (
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700"
                asChild
              >
                <Link href="#categories">
                  View All Categories
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                No courses found
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
                Try adjusting your search terms or explore different categories
              </p>
              <ClearFiltersButton />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isWishlisted={wishlistedCourseIds.has(course.id)}
                  />
                ))}
              </div>

              {courses.length > 8 && (
                <div className="text-center">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg"
                  >
                    Load More Courses
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Categories Section */}
        {!searchTerm && !categoryId && categories.length > 0 && (
          <div id="categories" className="mt-24 pt-16 border-t border-gray-200">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Explore by Category
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Discover courses across various topics and find what interests
                you most
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {categories.slice(0, 10).map((category) => (
                <Link
                  href={`/courses?categoryId=${category.id}`}
                  key={category.id}
                  className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-200 transition-colors">
                    <TrendingUp className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {category._count?.courses || 0} courses
                  </p>
                </Link>
              ))}
            </div>

            {categories.length > 10 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" className="border-gray-300">
                  View All Categories
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
