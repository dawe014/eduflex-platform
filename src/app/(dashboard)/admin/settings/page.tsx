import { Settings, Users, BookOpen, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { NotificationSettingsForm } from "../../settings/_components/notification-settings-form";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN")
    return redirect("/dashboard");

  const user = await db.user.findUnique({ where: { id: session.user.id } });

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Settings className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Platform Settings
          </h1>
          <p className="text-gray-600">
            Configure system-wide settings and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-gray-50">
              <Label
                htmlFor="new-registrations"
                className="flex flex-col space-y-1 cursor-pointer"
              >
                <span className="font-medium text-gray-900">
                  Allow New User Registrations
                </span>
                <span className="text-sm font-normal text-gray-500">
                  Disable this to prevent new users from signing up.
                </span>
              </Label>
              <Switch id="new-registrations" defaultChecked />
            </div>

            <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-gray-50">
              <Label
                htmlFor="new-courses"
                className="flex flex-col space-y-1 cursor-pointer"
              >
                <span className="font-medium text-gray-900">
                  Allow New Course Submissions
                </span>
                <span className="text-sm font-normal text-gray-500">
                  Disable this to prevent instructors from creating new courses.
                </span>
              </Label>
              <Switch id="new-courses" defaultChecked />
            </div>

            <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-gray-50">
              <Label
                htmlFor="course-approval"
                className="flex flex-col space-y-1 cursor-pointer"
              >
                <span className="font-medium text-gray-900">
                  Require Course Approval
                </span>
                <span className="text-sm font-normal text-gray-500">
                  Enable to manually approve all new courses before publishing.
                </span>
              </Label>
              <Switch id="course-approval" />
            </div>

            <div className="text-right pt-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationSettingsForm
              initialSettings={(user?.notifications as any) || {}}
            />
          </CardContent>
        </Card>
      </div>

     
    </div>
  );
}
