import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { title } = await req.json();
    const { courseId, chapterId } = await params;

    if (!session?.user || session.user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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

    const lastLesson = await db.lesson.findFirst({
      where: { chapterId: chapterId },
      orderBy: { position: "desc" },
    });
    const newPosition = lastLesson ? lastLesson.position + 1 : 1;

    const lesson = await db.lesson.create({
      data: {
        title,
        chapterId: chapterId,
        position: newPosition,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
