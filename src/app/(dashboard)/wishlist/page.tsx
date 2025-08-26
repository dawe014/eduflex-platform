// File: src/app/(dashboard)/wishlist/page.tsx
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CourseCard } from "@/components/courses/course-card";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");

  const wishlistItems = await db.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      course: { include: { category: true, enrollments: true, reviews: true } },
    },
  });

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <Heart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">My Wishlist</h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Your Wishlist is Empty</h2>
          <p className="text-muted-foreground mt-2">
            Add courses you want to save for later.
          </p>
          <Button asChild variant="default" className="mt-4">
            <Link href="/courses">Explore Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map(({ course }) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              imageUrl={course.imageUrl}
              category={course.category?.name}
              price={course.price}
              students={course.enrollments.length}
              rating={
                course.reviews.reduce((acc, r) => acc + r.rating, 0) /
                (course.reviews.length || 1)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
