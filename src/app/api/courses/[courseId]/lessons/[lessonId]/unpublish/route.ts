import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: { id: params.courseId, instructorId: session.user.id },
    });
    if (!courseOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const unpublishedLesson = await db.lesson.update({
      where: { id: params.lessonId, chapter: { courseId: params.courseId } },
      data: { isPublished: false },
    });

    return NextResponse.json(unpublishedLesson);
  } catch (error) {
    console.log("[LESSON_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
