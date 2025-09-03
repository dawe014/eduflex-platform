import { describe, it, expect, vi, beforeEach } from "vitest";
import { toggleWishlist } from "./wishlist-actions";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

// --- Mocking All External Dependencies ---
vi.mock("next-auth");
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    wishlist: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// --- Test Suite Setup ---
const mockGetServerSession = vi.mocked(getServerSession);
const mockDbWishlistFindUnique = vi.mocked(db.wishlist.findUnique);
const mockDbWishlistCreate = vi.mocked(db.wishlist.create);
const mockDbWishlistDelete = vi.mocked(db.wishlist.delete);
const mockRevalidatePath = vi.mocked(revalidatePath);

const generateMongoId = () => new Types.ObjectId().toHexString();

// Main test suite for the toggleWishlist server action
describe("toggleWishlist Server Action", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // --- Test Case 1: Adding a new item to the wishlist ---
  it("should ADD a course to the wishlist if it does not already exist", async () => {
    // Arrange
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const path = `/courses/${courseId}`;
    const userSession = { user: { id: userId } };

    mockGetServerSession.mockResolvedValue(userSession as any);
    // Mock that the item is NOT found in the wishlist
    mockDbWishlistFindUnique.mockResolvedValue(null);

    // Act
    const result = await toggleWishlist(courseId, path);

    // Assert
    expect(result.message).toBe("Added to wishlist");

    // Check that the correct database functions were called
    expect(mockDbWishlistFindUnique).toHaveBeenCalledTimes(1);
    expect(mockDbWishlistCreate).toHaveBeenCalledTimes(1);
    expect(mockDbWishlistCreate).toHaveBeenCalledWith({
      data: { userId, courseId },
    });
    expect(mockDbWishlistDelete).not.toHaveBeenCalled();

    // Check that revalidation was called
    expect(mockRevalidatePath).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePath).toHaveBeenCalledWith(path);
  });

  // --- Test Case 2: Removing an existing item from the wishlist ---
  it("should REMOVE a course from the wishlist if it already exists", async () => {
    // Arrange
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const path = `/courses/${courseId}`;
    const userSession = { user: { id: userId } };

    mockGetServerSession.mockResolvedValue(userSession as any);
    // Mock that the item IS found in the wishlist
    mockDbWishlistFindUnique.mockResolvedValue({
      id: generateMongoId(),
      userId,
      courseId,
      createdAt: new Date(),
    });

    // Act
    const result = await toggleWishlist(courseId, path);

    // Assert
    expect(result.message).toBe("Removed from wishlist");

    expect(mockDbWishlistFindUnique).toHaveBeenCalledTimes(1);
    expect(mockDbWishlistDelete).toHaveBeenCalledTimes(1);
    expect(mockDbWishlistDelete).toHaveBeenCalledWith({
      where: { userId_courseId: { userId, courseId } },
    });
    expect(mockDbWishlistCreate).not.toHaveBeenCalled();

    expect(mockRevalidatePath).toHaveBeenCalledWith(path);
  });

  // --- Test Case 3: User is not logged in ---
  it("should throw an error if the user is not authenticated", async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);

    // Act & Assert
    await expect(toggleWishlist(generateMongoId(), "/courses")).rejects.toThrow(
      "Unauthorized: You must be logged in to wishlist a course."
    );

    // Ensure no database calls were made
    expect(mockDbWishlistFindUnique).not.toHaveBeenCalled();
    expect(mockDbWishlistCreate).not.toHaveBeenCalled();
    expect(mockDbWishlistDelete).not.toHaveBeenCalled();
  });
});
