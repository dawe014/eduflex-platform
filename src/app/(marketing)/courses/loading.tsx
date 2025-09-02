import { CourseCardSkeleton } from "@/components/courses/course-card-skeleton";

const CoursesLoading = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* You can also create skeletons for the header and filters if you want */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {/* Render multiple skeletons to match the layout */}
        <CourseCardSkeleton />
        <CourseCardSkeleton />
        <CourseCardSkeleton />
        <CourseCardSkeleton />
        <CourseCardSkeleton />
        <CourseCardSkeleton />
        <CourseCardSkeleton />
        <CourseCardSkeleton />
      </div>
    </div>
  );
};

export default CoursesLoading;
