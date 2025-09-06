import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitReview } from "./review-actions";
import { db } from "@/lib/db";
import { getServerSession, Session } from "next-auth";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { UserRole, Enrollment } from "@prisma/client";

// --- Mocking All External Dependencies ---
vi.mock("next-auth");
vi.mock("@/lib/db", () => ({
  db: {
    enrollment: { findUnique: vi.fn() },
    review: { upsert: vi.fn() },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// --- Test Suite Setup ---
const mockGetServerSession = vi.mocked(getServerSession);
const mockDbEnrollmentFindUnique = vi.mocked(db.enrollment.findUnique);
const mockDbReviewUpsert = vi.mocked(db.review.upsert);
const mockRevalidatePath = vi.mocked(revalidatePath);

const generateMongoId = () => new Types.ObjectId().toHexString();

// --- Define Types for Mock Data ---
type MockSession = Session & { user: { id: string; role: UserRole } };
type MockEnrollment = Partial<Enrollment>;

describe("submitReview Server Action", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should successfully create or update a review for an enrolled user", async () => {
    // Arrange
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const studentSession: MockSession = {
      user: { id: userId, role: UserRole.STUDENT },
      expires: new Date().toISOString(),
    };
    const reviewData = { rating: 5, comment: "Great course!" };
    const enrollmentData: MockEnrollment = { id: generateMongoId() };

    mockGetServerSession.mockResolvedValue(studentSession);
    mockDbEnrollmentFindUnique.mockResolvedValue(enrollmentData as Enrollment);

    // Act
    const result = await submitReview(courseId, reviewData);

    // Assert
    expect(result.success).toBe(true);
    expect(result.message).toBe("Thank you for your review!");
    expect(mockDbEnrollmentFindUnique).toHaveBeenCalledTimes(1);
    expect(mockDbEnrollmentFindUnique).toHaveBeenCalledWith({
      where: { userId_courseId: { userId, courseId } },
    });
    expect(mockDbReviewUpsert).toHaveBeenCalledTimes(1);
    expect(mockDbReviewUpsert).toHaveBeenCalledWith({
      where: { userId_courseId: { userId, courseId } },
      update: reviewData,
      create: { ...reviewData, userId, courseId },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/courses/${courseId}`);
  });

  it("should throw an error if the user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const reviewData = { rating: 4, comment: "Good" };

    await expect(submitReview(generateMongoId(), reviewData)).rejects.toThrow(
      "You must be logged in to leave a review."
    );
    expect(mockDbEnrollmentFindUnique).not.toHaveBeenCalled();
    expect(mockDbReviewUpsert).not.toHaveBeenCalled();
  });

  it("should throw an error if the user is not enrolled in the course", async () => {
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const studentSession: MockSession = {
      user: { id: userId, role: UserRole.STUDENT },
      expires: new Date().toISOString(),
    };
    const reviewData = { rating: 5 };

    mockGetServerSession.mockResolvedValue(studentSession);
    mockDbEnrollmentFindUnique.mockResolvedValue(null); // User is NOT enrolled

    await expect(submitReview(courseId, reviewData)).rejects.toThrow(
      "You must be enrolled in this course to leave a review."
    );
    expect(mockDbReviewUpsert).not.toHaveBeenCalled();
  });

  it("should throw an error if the review data is invalid (e.g., rating is 0)", async () => {
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const studentSession: MockSession = {
      user: { id: userId, role: UserRole.STUDENT },
      expires: new Date().toISOString(),
    };
    const invalidReviewData = { rating: 0, comment: "This rating is invalid" };

    mockGetServerSession.mockResolvedValue(studentSession);

    await expect(submitReview(courseId, invalidReviewData)).rejects.toThrow(
      "Invalid review data."
    );
    expect(mockDbEnrollmentFindUnique).not.toHaveBeenCalled();
    expect(mockDbReviewUpsert).not.toHaveBeenCalled();
  });
});
