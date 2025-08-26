// File: src/app/courses/page.tsx
import { CourseCard } from "@/components/courses/course-card";
import { db } from "@/lib/db";

export default async function BrowseCoursesPage() {
  const courses = await db.course.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Browse Our Courses</h1>
      {courses.length === 0 && <p>No courses found. Check back soon!</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            imageUrl={course.imageUrl}
            category={course.category}
            price={course.price}
          />
        ))}
      </div>
    </div>
  );
}
