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

    // 1. Authentication Check
    if (!session?.user || session.user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Authorization Check
    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        instructorId: session.user.id,
      },
    });

    if (!courseOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 3. Update the chapter to be unpublished
    const unpublishedChapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: {
        isPublished: false,
      },
    });

    // 4. Advanced Logic: If unpublishing this chapter means no other chapters
    // in the course are published, then unpublish the entire course as well.
    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId: params.courseId,
        isPublished: true,
      },
    });

    if (publishedChaptersInCourse.length === 0) {
      await db.course.update({
        where: {
          id: params.courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return NextResponse.json(unpublishedChapter);
  } catch (error) {
    console.log("[CHAPTER_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
