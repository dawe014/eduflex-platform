import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { list } = await req.json();

    const courseOwner = await db.course.findUnique({
      where: { id: params.courseId, instructorId: session.user.id },
    });
    if (!courseOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Use a transaction to update all chapter positions in a single database operation
    const transaction = list.map((item: { id: string; position: number }) =>
      db.chapter.update({
        where: { id: item.id },
        data: { position: item.position },
      })
    );

    await db.$transaction(transaction);

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("[CHAPTERS_REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
