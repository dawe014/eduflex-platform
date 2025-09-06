import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCheckoutSession } from "./checkout-actions";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getServerSession, Session } from "next-auth";
import { headers } from "next/headers";
import { Types } from "mongoose";
import { UserRole, Course, Enrollment } from "@prisma/client";

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

// --- Define Types for Mock Data ---
type MockSession = Session & { user: { id: string; role: UserRole } };
type MockCourse = Partial<Course>;
type MockEnrollment = Partial<Enrollment>;

describe("createCheckoutSession Server Action", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should create and return a Stripe session URL for a valid, unenrolled user", async () => {
    // Arrange
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const userSession: MockSession = {
      user: { id: userId, role: UserRole.STUDENT },
      expires: new Date().toISOString(),
    };
    const courseData: MockCourse = {
      id: courseId,
      title: "Test Course",
      description: "A test course",
      price: 19.99,
      isPublished: true,
    };
    const mockStripeUrl = "https://checkout.stripe.com/session_123";

    mockGetServerSession.mockResolvedValue(userSession);
    mockHeaders.mockReturnValue(
      new Headers({ origin: "http://localhost:3000" })
    );
    mockDbCourseFindUnique.mockResolvedValue(courseData as Course);
    mockDbEnrollmentFindUnique.mockResolvedValue(null);
    mockStripeSessionsCreate.mockResolvedValue({ url: mockStripeUrl });

    // Act
    const result = await createCheckoutSession(courseId);

    // Assert
    expect(result.url).toBe(mockStripeUrl);
    expect(mockStripeSessionsCreate).toHaveBeenCalledTimes(1);
    expect(mockStripeSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { courseId, userId },
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({ unit_amount: 1999 }),
          }),
        ]),
      })
    );
  });

  it("should throw an error if the user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    await expect(createCheckoutSession(generateMongoId())).rejects.toThrow(
      "You must be logged in to enroll."
    );
    expect(mockStripeSessionsCreate).not.toHaveBeenCalled();
  });

  it("should throw an error if the course does not exist or is not published", async () => {
    const userSession: MockSession = {
      user: { id: generateMongoId(), role: UserRole.STUDENT },
      expires: new Date().toISOString(),
    };
    mockGetServerSession.mockResolvedValue(userSession);
    mockDbCourseFindUnique.mockResolvedValue(null);

    await expect(createCheckoutSession(generateMongoId())).rejects.toThrow(
      "Course not found."
    );
  });

  it("should throw an error if the user is already enrolled in the course", async () => {
    const userId = generateMongoId();
    const courseId = generateMongoId();
    const userSession: MockSession = {
      user: { id: userId, role: UserRole.STUDENT },
      expires: new Date().toISOString(),
    };
    const courseData: MockCourse = { id: courseId, price: 10.0 };
    const enrollmentData: MockEnrollment = { id: generateMongoId() };

    mockGetServerSession.mockResolvedValue(userSession);
    mockDbCourseFindUnique.mockResolvedValue(courseData as Course);
    mockDbEnrollmentFindUnique.mockResolvedValue(enrollmentData as Enrollment);

    await expect(createCheckoutSession(courseId)).rejects.toThrow(
      "You are already enrolled in this course."
    );
  });

  it("should throw an error if the course is free", async () => {
    const userSession: MockSession = {
      user: { id: generateMongoId(), role: UserRole.STUDENT },
      expires: new Date().toISOString(),
    };
    const courseData: MockCourse = { id: generateMongoId(), price: null };

    mockGetServerSession.mockResolvedValue(userSession);
    mockDbCourseFindUnique.mockResolvedValue(courseData as Course);

    await expect(createCheckoutSession(courseData.id!)).rejects.toThrow(
      "This course is free and cannot be purchased."
    );
  });

  it("should throw an error if Stripe fails to return a URL", async () => {
    const userSession: MockSession = {
      user: { id: generateMongoId(), role: UserRole.STUDENT },
      expires: new Date().toISOString(),
    };
    const courseData: MockCourse = { id: generateMongoId(), price: 29.99 };

    mockGetServerSession.mockResolvedValue(userSession);
    mockDbCourseFindUnique.mockResolvedValue(courseData as Course);
    mockDbEnrollmentFindUnique.mockResolvedValue(null);
    mockHeaders.mockReturnValue(
      new Headers({ origin: "http://localhost:3000" })
    );
    mockStripeSessionsCreate.mockResolvedValue({ url: null });

    await expect(createCheckoutSession(courseData.id!)).rejects.toThrow(
      "Could not create Stripe session."
    );
  });
});
