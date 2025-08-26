"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(courseId: string, path: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error(
      "Unauthorized: You must be logged in to wishlist a course."
    );
  }

  const userId = session.user.id;

  const existingWishlistItem = await db.wishlist.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existingWishlistItem) {
    await db.wishlist.delete({
      where: { userId_courseId: { userId, courseId } },
    });
    revalidatePath(path);
    return { message: "Removed from wishlist" };
  } else {
    await db.wishlist.create({
      data: { userId, courseId },
    });
    revalidatePath(path);
    return { message: "Added to wishlist" };
  }
}
