import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitReview } from "./review-actions"; // The action we're testing
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { UserRole } from "@prisma/client";

// --- Mocking All External Dependencies ---
vi.mock("next-auth");
vi.mock("@/lib/db", () => ({
  db: {
    enrollment: {
      findUnique: vi.fn(),
    },
    review: {
      upsert: vi.fn(),
    },
  },
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// --- Test Suite Setup ---
const mockGetServerSession = vi.mocked(getServerSession);
const mockDbEnrollmentFindUnique = vi.mocked(db.enrollment.findUnique);
const mockDbReviewUpsert = vi.mocked(db.review.upsert);
const mockRevalidatePath = vi.mocked(revalidatePath);

const generateMongoId = () => new Types.ObjectId().toHexString();

// Main test suite for the submitReview server action
describe("submitReview Server Action", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // --- Test Case 1: The "Happy Path" ---
  it("should successfully create or update a review for an enrolled user", async () => {
    // Arrange
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const studentSession = { user: { id: userId, role: UserRole.STUDENT } };
    const reviewData = { rating: 5, comment: "Great course!" };

    // Mock that the user is logged in
    mockGetServerSession.mockResolvedValue(studentSession);
    // Mock that the user is enrolled in the course
    mockDbEnrollmentFindUnique.mockResolvedValue({
      id: generateMongoId(),
    } as any);

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

    expect(mockRevalidatePath).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/courses/${courseId}`);
  });

  // --- Test Case 2: User is not logged in ---
  it("should throw an error if the user is not authenticated", async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const courseId = generateMongoId();
    const reviewData = { rating: 4, comment: "Good" };

    // Act & Assert
    await expect(submitReview(courseId, reviewData)).rejects.toThrow(
      "You must be logged in to leave a review."
    );

    // Ensure no database calls were made
    expect(mockDbEnrollmentFindUnique).not.toHaveBeenCalled();
    expect(mockDbReviewUpsert).not.toHaveBeenCalled();
  });

  // --- Test Case 3: User is not enrolled in the course ---
  it("should throw an error if the user is not enrolled in the course", async () => {
    // Arrange
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const studentSession = { user: { id: userId, role: UserRole.STUDENT } };
    const reviewData = { rating: 5 };

    mockGetServerSession.mockResolvedValue(studentSession);
    // Mock that the user is NOT enrolled
    mockDbEnrollmentFindUnique.mockResolvedValue(null);

    // Act & Assert
    await expect(submitReview(courseId, reviewData)).rejects.toThrow(
      "You must be enrolled in this course to leave a review."
    );

    expect(mockDbEnrollmentFindUnique).toHaveBeenCalledTimes(1);
    expect(mockDbReviewUpsert).not.toHaveBeenCalled(); // The most important check
  });

  // --- Test Case 4: Invalid form data ---
  it("should throw an error if the review data is invalid (e.g., rating is 0)", async () => {
    // Arrange
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const studentSession = { user: { id: userId, role: UserRole.STUDENT } };
    const invalidReviewData = { rating: 0, comment: "This rating is invalid" };

    mockGetServerSession.mockResolvedValue(studentSession);

    // Act & Assert
    await expect(submitReview(courseId, invalidReviewData)).rejects.toThrow(
      "Invalid review data."
    );

    expect(mockDbEnrollmentFindUnique).not.toHaveBeenCalled();
    expect(mockDbReviewUpsert).not.toHaveBeenCalled();
  });
});
