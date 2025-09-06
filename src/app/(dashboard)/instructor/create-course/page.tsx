import Link from "next/link";
import { BookOpen, ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCourseForm } from "./_components/create-course-form";

const CreateCoursePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/instructor/courses"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to My Courses
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CreateCourseForm />
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Course Creation Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">
                        1
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Be specific</strong> - Clear titles attract the
                      right students
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">
                        2
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Think about keywords</strong> - What would
                      students search for?
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">
                        3
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Keep it concise</strong> - Aim for 50-60
                      characters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  What&apos;s Next?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  After creating your course, you&apos;ll be redirected to the
                  setup page to add chapters, lessons, and more.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;
