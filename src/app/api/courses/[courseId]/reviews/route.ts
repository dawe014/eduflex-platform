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
    const { courseId } = params;
    const { rating, comment } = await req.json();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is enrolled
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId },
      },
    });
    if (!enrollment) {
      return new NextResponse("Not enrolled", { status: 403 });
    }

    // Check if user has already reviewed
    const existingReview = await db.review.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId },
      },
    });
    if (existingReview) {
      return new NextResponse("Already reviewed", { status: 403 });
    }

    const review = await db.review.create({
      data: {
        userId: session.user.id,
        courseId,
        rating,
        comment,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("[COURSE_REVIEW_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
