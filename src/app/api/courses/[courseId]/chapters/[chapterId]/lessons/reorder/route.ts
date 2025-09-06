import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { courseId, chapterId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { list } = await req.json();

    const chapterOwner = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId,
        course: { instructorId: session.user.id },
      },
    });
    if (!chapterOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const transaction = list.map((item: { id: string; position: number }) =>
      db.lesson.update({
        where: { id: item.id, chapterId: chapterId },
        data: { position: item.position },
      })
    );

    await db.$transaction(transaction);

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("[LESSON_REORDER]", error);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
