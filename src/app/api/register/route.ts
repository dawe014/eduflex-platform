// File: src/app/api/register/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 1. Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Use a 409 Conflict status code for existing resources
      return new NextResponse("User with this email already exists", {
        status: 409,
      });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create the new user
    const user = await db.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log("[REGISTER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
