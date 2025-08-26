import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Generic PATCH for updating lesson details (title, description, isFree)
export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { courseId, lessonId } = await params;
    const values = await req.json();

    if (!session?.user || session.user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: { id: courseId, instructorId: session.user.id },
    });
    if (!courseOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const lesson = await db.lesson.update({
      where: { id: lessonId, chapter: { courseId: courseId } },
      data: { ...values },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.log("[COURSE_LESSON_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE method for deleting a lesson
export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
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
    if (!lesson) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Advanced: Here you could add logic to delete associated video files from UploadThing

    const deletedLesson = await db.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json(deletedLesson);
  } catch (error) {
    console.log("[COURSE_LESSON_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
