import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const values = await req.json();
    const { courseId, chapterId } = await params;
    if (!session?.user || session.user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: { id: courseId, instructorId: session.user.id },
    });
    if (!courseOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const chapter = await db.chapter.update({
      where: { id: chapterId, courseId: courseId },
      data: { ...values },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[CHAPTER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE for a chapter
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { courseId, chapterId } = await params;

  if (!session?.user || session.user.role !== "INSTRUCTOR") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const courseOwner = await db.course.findUnique({
    where: { id: courseId, instructorId: session.user.id },
  });
  if (!courseOwner) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const deletedChapter = await db.chapter.delete({
    where: { id: chapterId, courseId: courseId },
  });
  return NextResponse.json(deletedChapter);
}
