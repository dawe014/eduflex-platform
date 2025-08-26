// File: src/app/api/courses/[courseId]/lessons/route.ts
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { title } = await req.json();
    const { courseId } = await params; // Get courseId from params for clarity

    if (!session?.user || session.user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: { id: courseId, instructorId: session.user.id },
    });

    if (!courseOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // --- START OF NEW LOGIC ---

    // 1. Find the last lesson to determine the new position
    const lastLesson = await db.lesson.findFirst({
      where: {
        courseId: courseId,
      },
      orderBy: {
        position: "desc", // Order by position descending to get the highest one
      },
    });

    // 2. Calculate the new position
    // If there's a last lesson, the new position is its position + 1.
    // If there are no lessons yet, the new position is 1.
    const newPosition = lastLesson ? lastLesson.position + 1 : 1;

    // --- END OF NEW LOGIC ---

    const lesson = await db.lesson.create({
      data: {
        title,
        courseId: courseId,
        position: newPosition, // 3. Provide the calculated position
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.log("[LESSONS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
