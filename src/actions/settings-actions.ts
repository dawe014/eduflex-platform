"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export type PlatformSettings = {
  allowNewRegistrations: boolean;
  allowCourseSubmissions: boolean;
};

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const settingsFromDb = await db.setting.findMany();

  // Define the default state of your platform's settings
  const defaultSettings: PlatformSettings = {
    allowNewRegistrations: true,
    allowCourseSubmissions: true,
  };

  const dbSettings = settingsFromDb.reduce(
    (acc: Record<string, unknown>, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    },
    {}
  );

  return { ...defaultSettings, ...dbSettings };
}

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
