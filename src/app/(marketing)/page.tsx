// File: src/app/(marketing)/page.tsx

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import {
  CheckCircle,
  ShieldCheck,
  Users,
  Star,
  ArrowRight,
  Play,
  Award,
  BookOpen,
  Clock,
  Globe,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CourseCard } from "@/components/courses/course-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// This is a Server Component, so we can fetch data directly
export default async function HomePage() {
  // Fetch a few featured courses to display on the homepage
  const featuredCourses = await db.course.findMany({
    where: {
      isPublished: true,
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
    },
  });

  return (
    <div className="bg-gradient-to-b from-slate-50 to-gray-100">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 z-0"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Unlock Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Potential
                </span>{" "}
                with EduFlex
              </h1>
              <p className="mt-6 text-xl text-gray-700 max-w-2xl">
                Discover a world of knowledge with our expert-led online
                courses. Learn at your own pace, anytime, anywhere.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  asChild
                >
                  <Link href="/courses">
                    Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-3 text-lg border-2"
                  asChild
                >
                  <Link href="/instructor/dashboard">Become an Instructor</Link>
                </Button>
              </div>
              <div className="mt-12 flex flex-wrap gap-8 justify-center lg:justify-start">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-gray-700 font-medium">
                    50,000+ Students
                  </span>
                </div>
                <div className="flex items-center">
                  <Award className="h-6 w-6 text-purple-600 mr-2" />
                  <span className="text-gray-700 font-medium">
                    Expert Instructors
                  </span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-gray-700 font-medium">
                    1,000+ Courses
                  </span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 mt-12 lg:mt-0">
              <div className="relative">
                <div className="bg-white rounded-2xl p-2 shadow-2xl">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <div className="bg-white p-6 rounded-full shadow-lg">
                      <Play className="h-12 w-12 text-blue-600 fill-current" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Interactive Learning</p>
                      <p className="text-sm text-gray-600">Hands-on projects</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Self-Paced</p>
                      <p className="text-sm text-gray-600">
                        Learn on your schedule
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                  id={course.id}
                  title={course.title}
                  imageUrl={course.imageUrl}
                  category={course.category?.name}
                  price={course.price}
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

      {/* 3. "Why Choose Us?" Section */}
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
              We're committed to providing the best learning experience for our
              students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-slate-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Instructors</h3>
              <p className="text-gray-600">
                Learn from industry professionals who bring real-world
                experience to every course.
              </p>
            </div>

            <div className="text-center p-6 bg-slate-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Flexible Learning</h3>
              <p className="text-gray-600">
                Access courses on any device and learn at a pace that works for
                you.
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
