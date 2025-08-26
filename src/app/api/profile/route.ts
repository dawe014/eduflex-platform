import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return new NextResponse("Unauthorized", { status: 401 });

    const values = await req.json();

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: values.name,
        bio: values.bio,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.log("[PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
