import { describe, it, expect, vi, beforeEach } from "vitest";
import { toggleLessonComplete } from "./progress-actions"; // The action we're testing
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { UserRole } from "@prisma/client";

// --- Mocking All External Dependencies ---
vi.mock("next-auth");
vi.mock("@/lib/db", () => ({
  db: {
    userProgress: {
      upsert: vi.fn(),
    },
  },
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// --- Test Suite Setup ---
const mockGetServerSession = vi.mocked(getServerSession);
const mockDbUserProgressUpsert = vi.mocked(db.userProgress.upsert);
const mockRevalidatePath = vi.mocked(revalidatePath);

const generateMongoId = () => new Types.ObjectId().toHexString();

// Main test suite for the toggleLessonComplete server action
describe("toggleLessonComplete Server Action", () => {
  // Reset all mocks before each individual test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // --- Test Case 1: The "Happy Path" ---
  it("should successfully create or update a user progress record for a logged-in user", async () => {
    // Arrange
    const userId = generateMongoId();
    const lessonId = generateMongoId();
    const pathname = `/courses/some-course/learn/lessons/${lessonId}`;
    const studentSession = { user: { id: userId, role: UserRole.STUDENT } };

    // Mock that the user is logged in
    mockGetServerSession.mockResolvedValue(studentSession);

    // Act: Call the function we are testing
    await toggleLessonComplete(lessonId, pathname);

    // Assert
    // Check that the database `upsert` function was called correctly
    expect(mockDbUserProgressUpsert).toHaveBeenCalledTimes(1);
    expect(mockDbUserProgressUpsert).toHaveBeenCalledWith({
      where: {
        userId_lessonId: { userId: userId, lessonId: lessonId },
      },
      update: { isCompleted: true },
      create: { userId: userId, lessonId: lessonId, isCompleted: true },
    });

    // Check that the cache revalidation was called with the correct path
    expect(mockRevalidatePath).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePath).toHaveBeenCalledWith(pathname);
  });

  // --- Test Case 2: User is not logged in ---
  it("should throw an error if the user is not authenticated", async () => {
    // Arrange
    const lessonId = generateMongoId();
    const pathname = `/courses/some-course/learn/lessons/${lessonId}`;

    // Mock that no user is logged in
    mockGetServerSession.mockResolvedValue(null);

    // Act & Assert
    // We expect the function call to be rejected with a specific error
    await expect(toggleLessonComplete(lessonId, pathname)).rejects.toThrow(
      "Unauthorized"
    );

    // Ensure no database or cache functions were called
    expect(mockDbUserProgressUpsert).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});
