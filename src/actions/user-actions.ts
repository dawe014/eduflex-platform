"use server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

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

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Admins only.");
  }
  if (userId === session.user.id) {
    throw new Error("Admins cannot delete their own account.");
  }

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

  const temporaryPassword = Math.random().toString(36).slice(-12);
  const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

  const newUser = await db.user.create({
    data: {
      name,
      email,
      role,
      hashedPassword,
      emailVerified: new Date(),
    },
  });

  revalidatePath("/admin/users");

  return {
    success: true,
    message: `User ${newUser.name} created successfully.`,
    temporaryPassword: temporaryPassword,
  };
}

export async function completeUserProfile(role: UserRole) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in.");
  }

  // Ensure the role is a valid enum value
  if (role !== "STUDENT" && role !== "INSTRUCTOR") {
    throw new Error("Invalid role selected.");
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { role },
  });

  revalidatePath("/profile");
  return { success: true, message: "Profile updated successfully!" };
}
