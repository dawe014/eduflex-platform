import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.hashedPassword) {
      return new NextResponse(
        "Password can only be changed for credential accounts",
        { status: 403 }
      );
    }

    // Verify the current password
    const isCorrectPassword = await bcrypt.compare(
      currentPassword,
      user.hashedPassword
    );
    if (!isCorrectPassword) {
      return new NextResponse("Incorrect current password", { status: 403 });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { id: user.id },
      data: { hashedPassword: hashedNewPassword },
    });

    return new NextResponse("Password updated successfully", { status: 200 });
  } catch (error) {
    console.error("[CHANGE_PASSWORD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
