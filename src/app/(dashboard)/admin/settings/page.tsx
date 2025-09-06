import { Settings } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPlatformSettings } from "@/actions/settings-actions";
import { SettingsForm } from "./_components/settings-form";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN")
    return redirect("/dashboard");

  const platformSettings = await getPlatformSettings();

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
          <p className="text-gray-600">Configure global application settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SettingsForm initialSettings={platformSettings} />
      </div>
    </div>
  );
}
