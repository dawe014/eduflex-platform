// File: src/app/(dashboard)/profile/page.tsx
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { ProfileForm } from "@/components/auth/profile-form";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return redirect("/");

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <User className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">My Profile</h1>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
