import { Settings } from "lucide-react";
import { NotificationSettingsForm } from "./_components/notification-settings-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Added Card components for consistent styling
import { Separator } from "@/components/ui/separator"; // Added Separator

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");

  const user = await db.user.findUnique({ where: { id: session.user.id } });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 md:px-6 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-gray-200">
          <div className="flex items-center gap-x-4">
            <Settings className="h-10 w-10 text-blue-600" />{" "}
            {/* Larger, colored icon */}
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
              Settings
            </h1>
          </div>
          <p className="text-lg text-gray-600 mt-2 md:mt-0">
            Manage your application preferences.
          </p>
        </div>

        {/* Settings Content Card */}
        <Card className="border-0 shadow-xl rounded-lg overflow-hidden max-w-2xl mx-auto">
          {" "}
          {/* Max width and center */}
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <Settings className="h-6 w-6" /> General Settings
            </CardTitle>
            <CardDescription className="text-blue-100 mt-1 text-base">
              Configure your account and application behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              Notification Preferences
            </h2>
            <Separator className="mb-6" /> {/* Separator before the form */}
            <NotificationSettingsForm
              initialSettings={(user?.notifications as any) || {}}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
