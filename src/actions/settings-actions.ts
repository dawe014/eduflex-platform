"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export type PlatformSettings = {
  allowNewRegistrations: boolean;
  allowCourseSubmissions: boolean;
};

/**
 * A server-side helper function to get the current platform settings.
 * It provides safe defaults if no settings are found in the database.
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const settingsFromDb = await db.setting.findMany();

  const defaultSettings: PlatformSettings = {
    allowNewRegistrations: true,
    allowCourseSubmissions: true,
  };

  const dbSettings = settingsFromDb.reduce((acc, setting) => {
    acc[setting.key] = setting.value as any;
    return acc;
  }, {} as any);

  return { ...defaultSettings, ...dbSettings };
}

/**
 * An admin-only server action to update platform settings.
 */
export async function updatePlatformSettings(
  settings: Partial<PlatformSettings>
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden: This action is restricted to administrators.");
  }

  const updatePromises = Object.entries(settings).map(([key, value]) =>
    db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  );

  await db.$transaction(updatePromises);

  revalidatePath("/admin/settings");

  return { success: true, message: "Settings updated successfully." };
}
