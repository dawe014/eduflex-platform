import { describe, it, expect, vi, beforeEach } from "vitest";
import { toggleWishlist } from "./wishlist-actions";
import { db } from "@/lib/db";
import { getServerSession, Session } from "next-auth";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { Wishlist } from "@prisma/client";

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

// --- Define Types for Mock Data ---
type MockSession = Omit<Session, "user"> & { user: { id: string } };
type MockWishlist = Partial<Wishlist>;

describe("toggleWishlist Server Action", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should ADD a course to the wishlist if it does not already exist", async () => {
    // Arrange
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const path = `/courses/${courseId}`;
    const userSession: MockSession = {
      user: { id: userId },
      expires: new Date().toISOString(),
    };

    mockGetServerSession.mockResolvedValue(userSession);
    mockDbWishlistFindUnique.mockResolvedValue(null);

    // Act
    const result = await toggleWishlist(courseId, path);

    // Assert
    expect(result.message).toBe("Added to wishlist");
    expect(mockDbWishlistCreate).toHaveBeenCalledTimes(1);
    expect(mockDbWishlistCreate).toHaveBeenCalledWith({
      data: { userId, courseId },
    });
    expect(mockDbWishlistDelete).not.toHaveBeenCalled();
    expect(mockRevalidatePath).toHaveBeenCalledWith(path);
  });

  it("should REMOVE a course from the wishlist if it already exists", async () => {
    // Arrange
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const path = `/courses/${courseId}`;
    const userSession: MockSession = {
      user: { id: userId },
      expires: new Date().toISOString(),
    };
    const wishlistItemData: MockWishlist = {
      id: generateMongoId(),
      userId,
      courseId,
      createdAt: new Date(),
    };

    mockGetServerSession.mockResolvedValue(userSession);
    mockDbWishlistFindUnique.mockResolvedValue(wishlistItemData as Wishlist);

    // Act
    const result = await toggleWishlist(courseId, path);

    // Assert
    expect(result.message).toBe("Removed from wishlist");
    expect(mockDbWishlistDelete).toHaveBeenCalledTimes(1);
    expect(mockDbWishlistDelete).toHaveBeenCalledWith({
      where: { userId_courseId: { userId, courseId } },
    });
    expect(mockDbWishlistCreate).not.toHaveBeenCalled();
  });

  it("should throw an error if the user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    await expect(toggleWishlist(generateMongoId(), "/courses")).rejects.toThrow(
      "Unauthorized: You must be logged in to wishlist a course."
    );
  });
});
