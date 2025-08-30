"use server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

// This function remains the same
export async function updateUserRole(userId: string, role: UserRole) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Admins only.");
  }
  if (userId === session.user.id) {
    throw new Error("Admins cannot change their own role.");
  }

  await db.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

// --- ADD THIS NEW FUNCTION ---
export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Admins only.");
  }
  if (userId === session.user.id) {
    throw new Error("Admins cannot delete their own account.");
  }

  // Advanced: You might want to handle what happens to an instructor's courses.
  // For now, Prisma's cascade delete will handle related data like enrollments, reviews, etc.
  const deletedUser = await db.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/users");
  return {
    success: true,
    message: `User ${deletedUser.name} deleted successfully.`,
  };
}

export async function addUserByAdmin(userData: {
  name: string;
  email: string;
  role: UserRole;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Admins only.");
  }

  const { name, email, role } = userData;

  // Validate input
  if (!name || !email || !role) {
    throw new Error("All fields are required.");
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("A user with this email already exists.");
  }

  // Create a secure, random temporary password
  // In a real-world scenario, you would typically send an email invitation
  // with a link to set a password. For this app, a long random string is sufficient.
  const temporaryPassword = Math.random().toString(36).slice(-12);
  const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

  const newUser = await db.user.create({
    data: {
      name,
      email,
      role,
      hashedPassword,
      // We can mark the email as verified since the admin is creating it
      emailVerified: new Date(),
    },
  });

  revalidatePath("/admin/users");

  // IMPORTANT: In a real app, you MUST inform the user of their temporary password.
  // Since we don't have an email system, we'll return it to the admin's UI.
  return {
    success: true,
    message: `User ${newUser.name} created successfully.`,
    temporaryPassword: temporaryPassword, // Return this for the admin to copy
  };
}
