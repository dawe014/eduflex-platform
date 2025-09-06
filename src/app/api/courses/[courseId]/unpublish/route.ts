import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { courseId } = params;

    // 1. Authentication: Check if user is logged in
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Authorization: Find the course to ensure the user is the owner
    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        instructorId: session.user.id,
      },
    });

    // If the course doesn't exist or the user is not the owner
    if (!courseOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 3. Update the course to be unpublished
    const unpublishedCourse = await db.course.update({
      where: {
        id: courseId,
        instructorId: session.user.id,
      },
      data: {
        isPublished: false,
      },
    });

    // 4. Return the updated course
    return NextResponse.json(unpublishedCourse);
  } catch (error) {
    console.error("[COURSE_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
