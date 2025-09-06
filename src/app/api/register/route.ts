import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getPlatformSettings } from "@/actions/settings-actions";
import { UserRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const settings = await getPlatformSettings();
    if (!settings.allowNewRegistrations) {
      return new NextResponse(
        "New user registrations are currently disabled by the administrator.",
        { status: 403 }
      );
    }

    const { name, email, password, role } = await req.json();

    // 1. Validate the incoming role
    if (!role || (role !== UserRole.STUDENT && role !== UserRole.INSTRUCTOR)) {
      return new NextResponse(
        "A valid role (STUDENT or INSTRUCTOR) must be selected.",
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return new NextResponse("A user with this email already exists.", {
        status: 409,
      });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create the new user with the specified role
    const user = await db.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_REGISTER]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
