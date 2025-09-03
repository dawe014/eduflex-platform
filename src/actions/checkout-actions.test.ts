import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCheckoutSession } from "./checkout-actions";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { Types } from "mongoose";
import { UserRole } from "@prisma/client";

// --- Mocking All External Dependencies ---
vi.mock("next-auth");
vi.mock("next/headers");
vi.mock("@/lib/db", () => ({
  db: {
    course: { findUnique: vi.fn() },
    enrollment: { findUnique: vi.fn() },
  },
}));
vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: { create: vi.fn() },
    },
  },
}));

// --- Test Suite Setup ---
const mockGetServerSession = vi.mocked(getServerSession);
const mockHeaders = vi.mocked(headers);
const mockDbCourseFindUnique = vi.mocked(db.course.findUnique);
const mockDbEnrollmentFindUnique = vi.mocked(db.enrollment.findUnique);
const mockStripeSessionsCreate = vi.mocked(stripe.checkout.sessions.create);

const generateMongoId = () => new Types.ObjectId().toHexString();

describe("createCheckoutSession Server Action", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // --- Test Case 1: The "Happy Path" ---
  it("should create and return a Stripe session URL for a valid, unenrolled user", async () => {
    // Arrange
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const userSession = { user: { id: userId, role: UserRole.STUDENT } };
    const courseData = {
      id: courseId,
      title: "Test Course",
      description: "A test course",
      price: 19.99,
      isPublished: true,
    };
    const mockStripeUrl = "https://checkout.stripe.com/session_123";

    mockGetServerSession.mockResolvedValue(userSession as any);
    mockHeaders.mockReturnValue(
      Promise.resolve({
        get: (key: string) =>
          key === "origin" ? "http://localhost:3000" : undefined,
      } as any)
    );
    mockDbCourseFindUnique.mockResolvedValue(courseData as any);
    mockDbEnrollmentFindUnique.mockResolvedValue(null); // User is NOT enrolled
    mockStripeSessionsCreate.mockResolvedValue({ url: mockStripeUrl } as any);

    // Act
    const result = await createCheckoutSession(courseId);

    // Assert
    expect(result.url).toBe(mockStripeUrl);
    expect(mockStripeSessionsCreate).toHaveBeenCalledTimes(1);
    expect(mockStripeSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        success_url: `http://localhost:3000/courses/${courseId}?success=1`,
        metadata: {
          courseId: courseId,
          userId: userId,
        },
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({ unit_amount: 1999 }),
          }),
        ]),
      })
    );
  });

  // --- Test Case 2: User not logged in ---
  it("should throw an error if the user is not authenticated", async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);

    // Act & Assert
    await expect(createCheckoutSession(generateMongoId())).rejects.toThrow(
      "You must be logged in to enroll."
    );
    expect(mockStripeSessionsCreate).not.toHaveBeenCalled();
  });

  // --- Test Case 3: Course not found ---
  it("should throw an error if the course does not exist or is not published", async () => {
    // Arrange
    const userSession = { user: { id: generateMongoId() } };
    mockGetServerSession.mockResolvedValue(userSession as any);
    mockDbCourseFindUnique.mockResolvedValue(null); // Course not found

    // Act & Assert
    await expect(createCheckoutSession(generateMongoId())).rejects.toThrow(
      "Course not found."
    );
    expect(mockStripeSessionsCreate).not.toHaveBeenCalled();
  });

  // --- Test Case 4: User already enrolled ---
  it("should throw an error if the user is already enrolled in the course", async () => {
    // Arrange
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const userSession = { user: { id: userId } };
    const courseData = { id: courseId, price: 10.0 };

    mockGetServerSession.mockResolvedValue(userSession as any);
    mockDbCourseFindUnique.mockResolvedValue(courseData as any);
    mockDbEnrollmentFindUnique.mockResolvedValue({
      id: generateMongoId(),
    } as any); // User IS enrolled

    // Act & Assert
    await expect(createCheckoutSession(courseId)).rejects.toThrow(
      "You are already enrolled in this course."
    );
    expect(mockStripeSessionsCreate).not.toHaveBeenCalled();
  });

  // --- Test Case 5: Course is free ---
  it("should throw an error if the course is free", async () => {
    // Arrange
    const userSession = { user: { id: generateMongoId() } };
    const courseData = { id: generateMongoId(), price: null }; // Free course

    mockGetServerSession.mockResolvedValue(userSession as any);
    mockDbCourseFindUnique.mockResolvedValue(courseData as any);

    // Act & Assert
    await expect(createCheckoutSession(courseData.id)).rejects.toThrow(
      "This course is free and cannot be purchased."
    );
    expect(mockStripeSessionsCreate).not.toHaveBeenCalled();
  });

  // --- Test Case 6: Stripe fails to create a session ---
  it("should throw an error if Stripe fails to return a URL", async () => {
    // Arrange
    const userSession = { user: { id: generateMongoId() } };
    const courseData = { id: generateMongoId(), price: 29.99 };

    mockGetServerSession.mockResolvedValue(userSession as any);
    mockDbCourseFindUnique.mockResolvedValue(courseData as any);
    mockDbEnrollmentFindUnique.mockResolvedValue(null);

    mockHeaders.mockReturnValue(
      Promise.resolve({
        get: (key: string) =>
          key === "origin" ? "http://localhost:3000" : undefined,
      } as any)
    );

    mockStripeSessionsCreate.mockResolvedValue({ url: null } as any); // Simulate Stripe failing

    // Act & Assert
    await expect(createCheckoutSession(courseData.id)).rejects.toThrow(
      "Could not create Stripe session."
    );
  });
});
