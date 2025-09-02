import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCourse,
  toggleCoursePublishByAdmin,
  deleteCourseByAdmin,
} from "./course-actions";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation"; // Import the function we need to mock
import { Types } from "mongoose";
import { UserRole } from "@prisma/client";

// --- Mocking All External Dependencies ---
vi.mock("next-auth");
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() })); // Mock the redirect function
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
const mockDbCourseCreate = vi.mocked(db.course.create);
const mockDbCourseFindUnique = vi.mocked(db.course.findUnique);
const mockDbCourseUpdate = vi.mocked(db.course.update);
const mockDbCourseDelete = vi.mocked(db.course.delete);
const mockRevalidatePath = vi.mocked(revalidatePath);
const mockRedirect = vi.mocked(redirect);

const generateMongoId = () => new Types.ObjectId().toHexString();

// Main test suite for all course-related server actions
describe("Course Server Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // --- Test Suite for createCourse ---
  describe("createCourse", () => {
    it("should successfully create a course for an INSTRUCTOR and redirect", async () => {
      // Arrange
      const instructorId = generateMongoId();
      const instructorSession = {
        user: { id: instructorId, role: UserRole.INSTRUCTOR },
      };
      mockGetServerSession.mockResolvedValue(instructorSession);

      const formData = new FormData();
      formData.append("title", "New Test Course");

      // Mock the database response
      mockDbCourseCreate.mockResolvedValue({
        id: generateMongoId(),
        title: "New Test Course",
      } as any);

      // Act
      await createCourse(formData);

      // Assert
      expect(mockDbCourseCreate).toHaveBeenCalledTimes(1);
      expect(mockDbCourseCreate).toHaveBeenCalledWith({
        data: {
          title: "New Test Course",
          instructorId: instructorId,
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/instructor/dashboard");
      expect(mockRedirect).toHaveBeenCalledWith("/instructor/dashboard");
    });

    it("should throw an error if called by a non-INSTRUCTOR user", async () => {
      const studentSession = {
        user: { id: generateMongoId(), role: UserRole.STUDENT },
      };
      mockGetServerSession.mockResolvedValue(studentSession);
      const formData = new FormData();
      formData.append("title", "Invalid Course");

      await expect(createCourse(formData)).rejects.toThrow("Unauthorized");
      expect(mockDbCourseCreate).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("should throw an error if the title is missing", async () => {
      const instructorSession = {
        user: { id: generateMongoId(), role: UserRole.INSTRUCTOR },
      };
      mockGetServerSession.mockResolvedValue(instructorSession);
      const formData = new FormData(); // Empty form data

      await expect(createCourse(formData)).rejects.toThrow("Title is required");
      expect(mockDbCourseCreate).not.toHaveBeenCalled();
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
      mockDbCourseFindUnique.mockResolvedValue(null); // Course not found

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
      mockDbCourseFindUnique.mockResolvedValue({ id: courseId } as any); // Course exists
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
