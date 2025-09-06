import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCourse,
  toggleCoursePublishByAdmin,
  deleteCourseByAdmin,
} from "./course-actions";
import { db } from "@/lib/db";
import { getServerSession, Session } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { UserRole, Course } from "@prisma/client";
import { getPlatformSettings } from "./settings-actions";

// --- Mocking All External Dependencies ---
vi.mock("next-auth");
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("./settings-actions", () => ({ getPlatformSettings: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    course: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// --- Test Suite Setup ---
const mockGetServerSession = vi.mocked(getServerSession);
const mockGetPlatformSettings = vi.mocked(getPlatformSettings);
const mockDbCourseCreate = vi.mocked(db.course.create);
const mockDbCourseFindUnique = vi.mocked(db.course.findUnique);
const mockDbCourseUpdate = vi.mocked(db.course.update);
const mockDbCourseDelete = vi.mocked(db.course.delete);
const mockRevalidatePath = vi.mocked(revalidatePath);
const mockRedirect = vi.mocked(redirect);

const generateMongoId = () => new Types.ObjectId().toHexString();

// --- Define Types for Mock Data ---
type MockSession = Session & { user: { id: string; role: UserRole } };

describe("Course Server Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetPlatformSettings.mockResolvedValue({
      allowCourseSubmissions: true,
      allowNewRegistrations: true,
    });
  });

  describe("createCourse", () => {
    it("should successfully create a course and redirect to its setup page", async () => {
      // Arrange
      const instructorId = generateMongoId();
      const newCourseId = generateMongoId();
      const instructorSession: MockSession = {
        user: { id: instructorId, role: UserRole.INSTRUCTOR },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(instructorSession);
      mockDbCourseCreate.mockResolvedValue({ id: newCourseId } as Course);

      const formData = new FormData();
      formData.append("title", "New Test Course");
      formData.append("description", "A brief description.");

      // Act
      await createCourse(formData);

      // Assert
      expect(mockDbCourseCreate).toHaveBeenCalledTimes(1);
      expect(mockDbCourseCreate).toHaveBeenCalledWith({
        data: {
          title: "New Test Course",
          description: "A brief description.",
          instructorId: instructorId,
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/instructor/courses");
      expect(mockRedirect).toHaveBeenCalledWith(
        `/instructor/courses/${newCourseId}`
      );
    });

    it("should throw an error if course submissions are disabled by admin", async () => {
      const instructorSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.INSTRUCTOR },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(instructorSession);
      mockGetPlatformSettings.mockResolvedValue({
        allowCourseSubmissions: false,
        allowNewRegistrations: true,
      });

      const formData = new FormData();
      formData.append("title", "This should fail");

      await expect(createCourse(formData)).rejects.toThrow(
        "New course submissions are currently disabled"
      );
    });

    it("should throw an error if called by a non-INSTRUCTOR user", async () => {
      const studentSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.STUDENT },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(studentSession);
      const formData = new FormData();
      formData.append("title", "Invalid Course");

      await expect(createCourse(formData)).rejects.toThrow("Unauthorized");
    });

    it("should throw an error if the title is too short", async () => {
      const instructorSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.INSTRUCTOR },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(instructorSession);
      const formData = new FormData();
      formData.append("title", "Hi");

      await expect(createCourse(formData)).rejects.toThrow(
        "Title is required and must be at least 3 characters long."
      );
    });
  });

  describe("toggleCoursePublishByAdmin", () => {
    it("should publish a draft course when called by an ADMIN", async () => {
      const adminSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      const courseId = generateMongoId();
      mockDbCourseFindUnique.mockResolvedValue({
        id: courseId,
        isPublished: false,
      } as Course);
      mockDbCourseUpdate.mockResolvedValue({
        id: courseId,
        isPublished: true,
      } as Course);

      const result = await toggleCoursePublishByAdmin(courseId);

      expect(result.success).toBe(true);
      expect(result.message).toContain("published");
    });

    it("should unpublish a published course when called by an ADMIN", async () => {
      const adminSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      const courseId = generateMongoId();
      mockDbCourseFindUnique.mockResolvedValue({
        id: courseId,
        isPublished: true,
      } as Course);
      mockDbCourseUpdate.mockResolvedValue({
        id: courseId,
        isPublished: false,
      } as Course);

      const result = await toggleCoursePublishByAdmin(courseId);

      expect(result.success).toBe(true);
      expect(result.message).toContain("unpublished");
    });

    it("should throw an error if the course is not found", async () => {
      const adminSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      mockDbCourseFindUnique.mockResolvedValue(null);

      await expect(
        toggleCoursePublishByAdmin(generateMongoId())
      ).rejects.toThrow("Course not found.");
    });
  });

  describe("deleteCourseByAdmin", () => {
    it("should successfully delete a course when called by an ADMIN", async () => {
      const adminSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      const courseId = generateMongoId();
      mockDbCourseFindUnique.mockResolvedValue({ id: courseId } as Course);
      mockDbCourseDelete.mockResolvedValue({
        title: "Deleted Course",
      } as Course);

      const result = await deleteCourseByAdmin(courseId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Course "Deleted Course" has been deleted.');
    });

    it("should throw an error if called by a non-ADMIN user", async () => {
      const studentSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.STUDENT },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(studentSession);

      await expect(deleteCourseByAdmin(generateMongoId())).rejects.toThrow(
        "Forbidden: Admins only."
      );
    });
  });
});
