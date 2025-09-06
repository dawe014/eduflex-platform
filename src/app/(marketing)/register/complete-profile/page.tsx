import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  GraduationCap,
  BookOpen,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@prisma/client";
export default async function CompleteProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.NEW_USER) {
    return redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to EduFlex!
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We&apos;re excited to have you, {session.user.name}! Let&apos;s
            personalize your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Role Selection Card */}
          <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <User className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Choose Your Path
                </CardTitle>
              </div>
              <CardDescription className="text-blue-100">
                Select how you&apos;d like to use EduFlex. You can always update
                this later.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <CompleteProfileForm />
            </CardContent>
          </Card>

          {/* Role Information Sidebar */}
          <div className="space-y-6">
            {/* Student Card */}
            <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      As a Student
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>Access thousands of courses</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>Track your learning progress</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>Get certificates of completion</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>Join student community</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Card */}
            <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-600 rounded-xl flex-shrink-0">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      As an Instructor
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>Create and sell your courses</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>Reach students worldwide</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>Earn revenue from your expertise</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>Get teaching resources and support</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-gray-50 to-white">
              <CardContent className="p-6 text-center">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">10K+</div>
                    <div className="text-sm text-gray-600">Active Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      100K+
                    </div>
                    <div className="text-sm text-gray-600">Happy Students</div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Join our growing community
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
