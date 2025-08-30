import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import {
  CheckCircle,
  ShieldCheck,
  Users,
  Star,
  ArrowRight,
  Award,
  BookOpen,
  Clock,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { CourseCard } from "@/components/courses/course-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HeroSlider } from "@/components/layout/hero-slider";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // --- 1. Fetch Featured Courses ---
  const featuredCourses = await db.course.findMany({
    where: { isPublished: true },
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
    take: 3, // Limit to 3 for a clean grid
    orderBy: {
      enrollments: { _count: "desc" }, // Most popular
    },
  });

  // --- 2. Fetch User Wishlist ---
  const userWishlist = session?.user
    ? await db.wishlist.findMany({
        where: { userId: session.user.id },
        select: { courseId: true },
      })
    : [];
  const wishlistedCourseIds = new Set(
    userWishlist.map((item) => item.courseId)
  );

  // --- 3. Fetch Platform Stats ---
  const [totalCourses, totalEnrollments] = await Promise.all([
    db.course.count({ where: { isPublished: true } }),
    db.enrollment.count(),
  ]);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-gray-100">
      {/* 1. Hero Section with Slider */}
      <HeroSlider />

      {/* Hero Stats */}
      <div className="relative z-10 -mt-16 md:-mt-20 container mx-auto px-4">
        <div className="bg-white rounded-2xl p-6 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-4 text-center border">
          <div className="flex flex-col items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <p className="font-bold text-xl">
              {totalCourses.toLocaleString()}+
            </p>
            <p className="text-sm text-gray-500">Online Courses</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Award className="h-8 w-8 text-purple-600" />
            <p className="font-bold text-xl">Expert</p>
            <p className="text-sm text-gray-500">Instructors</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Users className="h-8 w-8 text-green-600" />
            <p className="font-bold text-xl">
              {totalEnrollments.toLocaleString()}+
            </p>
            <p className="text-sm text-gray-500">Happy Students</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Clock className="h-8 w-8 text-orange-600" />
            <p className="font-bold text-xl">Lifetime</p>
            <p className="text-sm text-gray-500">Access</p>
          </div>
        </div>
      </div>

      {/* 2. Featured Courses Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Courses
              </span>
            </h2>
            <p className="text-xl text-gray-700">
              Discover our most popular courses taught by industry experts
            </p>
          </div>

          {featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isWishlisted={wishlistedCourseIds.has(course.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                No featured courses available at the moment. Check back soon!
              </p>
            </div>
          )}

          <div className="text-center mt-16">
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-3 border-2"
              asChild
            >
              <Link href="/courses">
                View All Courses <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                EduFlex
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-700">
              We're committed to providing the best learning experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-slate-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Instructors</h3>
              <p className="text-gray-600">
                Learn from professionals who bring real-world experience.
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Flexible Learning</h3>
              <p className="text-gray-600">
                Access courses on any device and learn at your own pace.
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lifetime Access</h3>
              <p className="text-gray-600">
                Enroll once and have unlimited access to your courses forever.
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="bg-amber-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Global Community</h3>
              <p className="text-gray-600">
                Join thousands of students from around the world learning
                together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Students
              </span>{" "}
              Say
            </h2>
            <p className="text-xl text-gray-700">
              Don't just take our word for it - hear from our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center gap-x-4 pb-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/avatars/01.png" />
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    AJ
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Alice Johnson</p>
                  <p className="text-sm text-muted-foreground">
                    Web Development Student
                  </p>
                </div>
                <div className="ml-auto flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  &quot;The Next.js course on EduFlex was a game-changer for my
                  career. The instructor was clear, concise, and the hands-on
                  projects were invaluable.&quot;
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center gap-x-4 pb-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/avatars/02.png" />
                  <AvatarFallback className="bg-green-100 text-green-800">
                    BC
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Ben Carter</p>
                  <p className="text-sm text-muted-foreground">
                    Data Science Student
                  </p>
                </div>
                <div className="ml-auto flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  &quot;I was new to data science, but the beginner-friendly
                  course on this platform made complex topics easy to
                  understand. Highly recommended!&quot;
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Instructor Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Become an Instructor Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Share your expertise with a global audience, earn money, and build
              your personal brand. We provide the tools and support to help you
              succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-3 text-lg bg-white text-blue-600 hover:bg-gray-100"
                asChild
              >
                <Link href="/instructor/dashboard">Start Teaching Today</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-lg border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/instructor/guide">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
