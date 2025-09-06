import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { User, Shield, CreditCard } from "lucide-react";
import { ProfileForm } from "@/components/auth/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChangePasswordModal } from "@/components/auth/change-password-modal";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return redirect("/");

  const hasPassword = !!user.hashedPassword;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        {/* Header  */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-gray-200">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight flex items-center gap-3">
              <User className="h-8 w-8 text-blue-600" /> Your Profile
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Manage your account settings and preferences.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl rounded-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                  <User className="h-6 w-6" /> Personal Information
                </CardTitle>
                <CardDescription className="text-blue-100 mt-1 text-base">
                  Update your name and email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <ProfileForm user={user} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Security, Billing, Notifications Cards */}
          <div className="space-y-6">
            {/* Security Card */}
            <Card className="border-0 shadow-lg rounded-lg">
              <CardHeader className="pb-4 pt-5 px-6">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <Shield className="h-6 w-6 text-red-600" />
                  Security
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Manage your account&apos;s security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {hasPassword ? (
                  <ChangePasswordModal />
                ) : (
                  <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <span className="font-medium">Note:</span> Password changes
                    are not available for accounts created via social login.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Billing Card */}
            <Card className="border-0 shadow-lg rounded-lg">
              <CardHeader className="pb-4 pt-5 px-6">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <CreditCard className="h-6 w-6 text-green-600" />
                  Billing
                </CardTitle>
                <CardDescription className="text-gray-500">
                  View your purchase history and manage subscriptions.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <Button
                  asChild
                  className="w-full justify-center py-2 text-lg font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border-blue-200 border"
                >
                  <Link href="/billing">View Purchase History</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
