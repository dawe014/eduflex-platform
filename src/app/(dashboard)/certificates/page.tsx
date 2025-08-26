import { GraduationCap, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function MyCertificatesPage() {
  // TODO: Fetch courses where the student has 100% progress
  const completedCourses = [
    {
      id: "1",
      title: "The Ultimate Next.js 14 Course",
      completedOn: new Date(),
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <GraduationCap className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">My Certificates</h1>
      </div>

      {completedCourses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No Certificates Yet</h2>
          <p className="text-muted-foreground mt-2">
            Complete a course 100% to earn your certificate.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedCourses.map((course) => (
            <Card
              key={course.id}
              className="flex flex-col md:flex-row items-center justify-between p-4"
            >
              <div className="flex items-center gap-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Completed on: {course.completedOn.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button className="mt-4 md:mt-0">Download Certificate</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
