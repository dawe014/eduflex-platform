// File: src/actions/contact-actions.ts
"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessageStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import * as z from "zod";

// Schema for validating the form data
const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("A valid email is required"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

/**
 * Action for any visitor (guest or user) to submit a contact message.
 * The message is saved to the database for admin review.
 */
export async function submitContactMessage(
  formData: z.infer<typeof contactSchema>
) {
  // 1. Validate the data on the server
  const validation = contactSchema.safeParse(formData);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  const { name, email, subject, message } = validation.data;

  // 2. Check if a user is logged in
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id; // Will be null if user is a guest

  // 3. Save the message to the database
  try {
    await db.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        // Link to the user account if they are logged in
        userId: userId,
      },
    });

    revalidatePath("/admin/messages"); // Let the admin dashboard know new data is available
    return {
      success: true,
      message: "Your message has been sent successfully!",
    };
  } catch (error) {
    console.error("CONTACT_MESSAGE_ERROR:", error);
    throw new Error("Failed to send message. Please try again later.");
  }
}

/**
 * Action for an ADMIN to update the status of a message.
 */
export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Admins only.");
  }

  await db.contactMessage.update({
    where: { id: messageId },
    data: { status },
  });

  revalidatePath("/admin/messages");
  return { success: true, message: `Message status updated to ${status}.` };
}

/**
 * Action for an ADMIN to delete a contact message.
 */
export async function deleteContactMessage(messageId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Admins only.");
  }

  await db.contactMessage.delete({
    where: { id: messageId },
  });

  revalidatePath("/admin/messages");
  return { success: true, message: "Message deleted successfully." };
}
