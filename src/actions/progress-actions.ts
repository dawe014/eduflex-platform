"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function toggleLessonComplete(lessonId: string, pathname: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Upsert will create or update the progress record
  await db.userProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { isCompleted: true },
    create: { userId: session.user.id, lessonId, isCompleted: true },
  });

  revalidatePath(pathname);
}
