"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const contactSchema = z.object({
  subject: z
    .string()
    .min(3, { message: "Subject must be at least 3 characters." }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." }),
});

export async function createContactTicket(formData: {
  subject: string;
  message: string;
}) {
  try {
    // --- ADD THIS TRY BLOCK ---
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("You must be logged in to send a message.");
    }

    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      // Throw the first validation error message
      throw new Error(validation.error.errors[0].message);
    }
    const { subject, message } = validation.data;

    await db.contactTicket.create({
      data: {
        subject,
        userId: session.user.id,
        messages: {
          create: [
            {
              content: message,
              userId: session.user.id,
            },
          ],
        },
      },
    });

    revalidatePath("/contact");
    return {
      success: true,
      message: "Your message has been sent successfully! We will reply soon.",
    };
  } catch (error: any) {
    // --- ADD THIS CATCH BLOCK ---
    console.error("CREATE_CONTACT_TICKET_ERROR:", error);
    // This makes sure a specific error message is always sent back to the client
    throw new Error(
      error.message || "An unexpected error occurred on the server."
    );
  }
}

// Action for an admin to reply to a ticket
export async function replyToTicket(ticketId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Admins only.");
  }
  if (!content.trim()) {
    throw new Error("Reply content cannot be empty.");
  }

  await db.ticketMessage.create({
    data: {
      ticketId,
      content,
      userId: session.user.id,
    },
  });

  // Optionally, re-open the ticket if it was closed
  await db.contactTicket.update({
    where: { id: ticketId },
    data: { status: "OPEN" },
  });

  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true, message: "Reply sent successfully." };
}
