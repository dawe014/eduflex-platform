import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { courseId, lessonId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: { id: courseId, instructorId: session.user.id },
    });
    if (!courseOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId, chapter: { courseId: courseId } },
    });
    if (!lesson || !lesson.title || !lesson.description || !lesson.videoUrl) {
      return new NextResponse("Missing required fields to publish lesson", {
        status: 400,
      });
    }

    const publishedLesson = await db.lesson.update({
      where: { id: lessonId, chapter: { courseId: courseId } },
      data: { isPublished: true },
    });

    return NextResponse.json(publishedLesson);
  } catch (error) {
    console.error("[PUBLISH_LESSON]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
