import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCourse,
  toggleCoursePublishByAdmin,
  deleteCourseByAdmin,
} from "./course-actions";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { UserRole } from "@prisma/client";
import { getPlatformSettings } from "./settings-actions"; // Import the new dependency

// --- Mocking All External Dependencies ---
vi.mock("next-auth");
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("./settings-actions", () => ({ getPlatformSettings: vi.fn() })); // Mock the settings helper
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

describe("Course Server Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default mock for platform settings - allow submissions
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
      const instructorSession = {
        user: { id: instructorId, role: UserRole.INSTRUCTOR },
      };
      mockGetServerSession.mockResolvedValue(instructorSession);
      mockDbCourseCreate.mockResolvedValue({ id: newCourseId } as any);

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
      // Path is now more specific
      expect(mockRevalidatePath).toHaveBeenCalledWith("/instructor/courses");
      // Redirect is now dynamic to the new course ID
      expect(mockRedirect).toHaveBeenCalledWith(
        `/instructor/courses/${newCourseId}`
      );
    });

    it("should throw an error if course submissions are disabled by admin", async () => {
      // Arrange
      const instructorSession = {
        user: { id: generateMongoId(), role: UserRole.INSTRUCTOR },
      };
      mockGetServerSession.mockResolvedValue(instructorSession);
      // --- OVERRIDE MOCK ---
      mockGetPlatformSettings.mockResolvedValue({
        allowCourseSubmissions: false,
        allowNewRegistrations: true,
      });

      const formData = new FormData();
      formData.append("title", "This should fail");

      // Act & Assert
      await expect(createCourse(formData)).rejects.toThrow(
        "New course submissions are currently disabled"
      );
      expect(mockDbCourseCreate).not.toHaveBeenCalled();
    });

    it("should throw an error if called by a non-INSTRUCTOR user", async () => {
      const studentSession = {
        user: { id: generateMongoId(), role: UserRole.STUDENT },
      };
      mockGetServerSession.mockResolvedValue(studentSession);
      const formData = new FormData();
      formData.append("title", "Invalid Course");

      await expect(createCourse(formData)).rejects.toThrow("Unauthorized");
    });

    it("should throw an error if the title is too short", async () => {
      const instructorSession = {
        user: { id: generateMongoId(), role: UserRole.INSTRUCTOR },
      };
      mockGetServerSession.mockResolvedValue(instructorSession);
      const formData = new FormData();
      formData.append("title", "Hi"); // Title is less than 3 characters

      await expect(createCourse(formData)).rejects.toThrow(
        "Title is required and must be at least 3 characters long."
      );
    });
  });

  // --- Test Suite for toggleCoursePublishByAdmin ---
  describe("toggleCoursePublishByAdmin", () => {
    it("should publish a draft course when called by an ADMIN", async () => {
      // Arrange
      const adminSession = { user: { role: UserRole.ADMIN } } as any;
      mockGetServerSession.mockResolvedValue(adminSession);
      const courseId = generateMongoId();
      // Simulate finding a draft course
      mockDbCourseFindUnique.mockResolvedValue({
        id: courseId,
        isPublished: false,
      } as any);
      // Simulate the update result
      mockDbCourseUpdate.mockResolvedValue({
        id: courseId,
        isPublished: true,
      } as any);

      // Act
      const result = await toggleCoursePublishByAdmin(courseId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain("published");
      expect(mockDbCourseUpdate).toHaveBeenCalledWith({
        where: { id: courseId },
        data: { isPublished: true },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/courses");
    });

    it("should unpublish a published course when called by an ADMIN", async () => {
      // Arrange
      const adminSession = { user: { role: UserRole.ADMIN } } as any;
      mockGetServerSession.mockResolvedValue(adminSession);
      const courseId = generateMongoId();
      mockDbCourseFindUnique.mockResolvedValue({
        id: courseId,
        isPublished: true,
      } as any);
      mockDbCourseUpdate.mockResolvedValue({
        id: courseId,
        isPublished: false,
      } as any);

      // Act
      const result = await toggleCoursePublishByAdmin(courseId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain("unpublished");
      expect(mockDbCourseUpdate).toHaveBeenCalledWith({
        where: { id: courseId },
        data: { isPublished: false },
      });
    });

    it("should throw an error if the course is not found", async () => {
      const adminSession = { user: { role: UserRole.ADMIN } } as any;
      mockGetServerSession.mockResolvedValue(adminSession);
      mockDbCourseFindUnique.mockResolvedValue(null);

      await expect(
        toggleCoursePublishByAdmin(generateMongoId())
      ).rejects.toThrow("Course not found.");
    });
  });

  // --- Test Suite for deleteCourseByAdmin ---
  describe("deleteCourseByAdmin", () => {
    it("should successfully delete a course when called by an ADMIN", async () => {
      // Arrange
      const adminSession = { user: { role: UserRole.ADMIN } } as any;
      mockGetServerSession.mockResolvedValue(adminSession);
      const courseId = generateMongoId();
      mockDbCourseFindUnique.mockResolvedValue({ id: courseId } as any);
      mockDbCourseDelete.mockResolvedValue({ title: "Deleted Course" } as any);

      // Act
      const result = await deleteCourseByAdmin(courseId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Course "Deleted Course" has been deleted.');
      expect(mockDbCourseDelete).toHaveBeenCalledWith({
        where: { id: courseId },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/courses");
    });

    it("should throw an error if called by a non-ADMIN user", async () => {
      const studentSession = { user: { role: UserRole.STUDENT } } as any;
      mockGetServerSession.mockResolvedValue(studentSession);

      await expect(deleteCourseByAdmin(generateMongoId())).rejects.toThrow(
        "Forbidden: Admins only."
      );
      expect(mockDbCourseDelete).not.toHaveBeenCalled();
    });
  });
});
