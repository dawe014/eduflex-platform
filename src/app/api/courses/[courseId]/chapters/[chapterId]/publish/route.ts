import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { courseId, chapterId } = await params;
    // 1. Authentication Check
    if (!session?.user || session.user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Authorization Check: Ensure the user owns the course
    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        instructorId: session.user.id,
      },
    });

    if (!courseOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 3. Find the specific chapter to be published
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId,
      },
    });

    if (!chapter) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 4. Validation Check: Ensure the chapter has the minimum required content
    if (!chapter.title || !chapter.description) {
      return new NextResponse(
        "Missing required fields to publish this chapter",
        {
          status: 400,
        }
      );
    }

    // 5. Update the chapter to be published
    const publishedChapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: {
        isPublished: true,
      },
    });

    return NextResponse.json(publishedChapter);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
