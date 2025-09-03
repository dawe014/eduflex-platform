import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import {
  updateUserRole,
  deleteUser,
  addUserByAdmin,
  completeUserProfile,
} from "./user-actions";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

// --- Mocking All External Dependencies ---
vi.mock("next-auth");
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      update: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("bcrypt");

// --- Test Suite Setup ---
const mockGetServerSession = vi.mocked(getServerSession);
const mockDbUserUpdate = vi.mocked(db.user.update);
const mockDbUserDelete = vi.mocked(db.user.delete);
const mockDbUserCreate = vi.mocked(db.user.create);
const mockDbUserFindUnique = vi.mocked(db.user.findUnique);
const mockRevalidatePath = vi.mocked(revalidatePath);
const mockBcryptHash = vi.mocked(bcrypt.hash);

// Helper function to generate valid MongoDB ObjectIDs for tests
const generateMongoId = () => new Types.ObjectId().toHexString();

// Main test suite for all user-related server actions
describe("User Server Actions", () => {
  // Reset all mocks before each individual test runs to ensure isolation
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // --- Test Suite for updateUserRole ---
  describe("updateUserRole", () => {
    it("should successfully update a user role when called by an ADMIN", async () => {
      // Arrange
      const adminSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      const targetUserId = generateMongoId();
      const newRole = UserRole.INSTRUCTOR;

      // Act
      const result = await updateUserRole(targetUserId, newRole);

      // Assert
      expect(result.success).toBe(true);
      expect(mockDbUserUpdate).toHaveBeenCalledTimes(1);
      expect(mockDbUserUpdate).toHaveBeenCalledWith({
        where: { id: targetUserId },
        data: { role: newRole },
      });
      expect(mockRevalidatePath).toHaveBeenCalledTimes(1);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/users");
    });

    it("should throw an error if called by a non-ADMIN user", async () => {
      const studentSession = {
        user: { id: generateMongoId(), role: UserRole.STUDENT },
      };
      mockGetServerSession.mockResolvedValue(studentSession);

      await expect(
        updateUserRole(generateMongoId(), UserRole.ADMIN)
      ).rejects.toThrow("Forbidden: Admins only.");
      expect(mockDbUserUpdate).not.toHaveBeenCalled();
    });

    it("should throw an error if an ADMIN tries to change their own role", async () => {
      const adminId = generateMongoId();
      const adminSession = { user: { id: adminId, role: UserRole.ADMIN } };
      mockGetServerSession.mockResolvedValue(adminSession);

      await expect(updateUserRole(adminId, UserRole.STUDENT)).rejects.toThrow(
        "Admins cannot change their own role."
      );
      expect(mockDbUserUpdate).not.toHaveBeenCalled();
    });

    it("should throw an error if no user is logged in", async () => {
      mockGetServerSession.mockResolvedValue(null);
      await expect(
        updateUserRole(generateMongoId(), UserRole.STUDENT)
      ).rejects.toThrow("Forbidden: Admins only.");
      expect(mockDbUserUpdate).not.toHaveBeenCalled();
    });
  });

  // --- Test Suite for deleteUser ---
  describe("deleteUser", () => {
    it("should successfully delete a user when called by an ADMIN", async () => {
      // Arrange
      const adminSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      const targetUserId = generateMongoId();
      mockDbUserDelete.mockResolvedValue({
        id: targetUserId,
        name: "Deleted User",
      } as any);

      // Act
      const result = await deleteUser(targetUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe("User Deleted User deleted successfully.");
      expect(mockDbUserDelete).toHaveBeenCalledTimes(1);
      expect(mockDbUserDelete).toHaveBeenCalledWith({
        where: { id: targetUserId },
      });
      expect(mockRevalidatePath).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if an ADMIN tries to delete themselves", async () => {
      const adminId = generateMongoId();
      const adminSession = { user: { id: adminId, role: UserRole.ADMIN } };
      mockGetServerSession.mockResolvedValue(adminSession);

      await expect(deleteUser(adminId)).rejects.toThrow(
        "Admins cannot delete their own account."
      );
      expect(mockDbUserDelete).not.toHaveBeenCalled();
    });

    it("should throw an error if called by a non-ADMIN user", async () => {
      const instructorSession = {
        user: { id: generateMongoId(), role: UserRole.INSTRUCTOR },
      };
      mockGetServerSession.mockResolvedValue(instructorSession);

      await expect(deleteUser(generateMongoId())).rejects.toThrow(
        "Forbidden: Admins only."
      );
      expect(mockDbUserDelete).not.toHaveBeenCalled();
    });
  });

  // --- Test Suite for addUserByAdmin ---
  describe("addUserByAdmin", () => {
    it("should successfully create a new user and return a temporary password", async () => {
      // Arrange
      const adminSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      mockDbUserFindUnique.mockResolvedValue(null);
      (bcrypt.hash as unknown as Mock).mockResolvedValue(
        "a_long_hashed_password"
      );
      mockDbUserCreate.mockResolvedValue({ name: "Jane Doe" } as any);
      const newUserdata = {
        name: "Jane Doe",
        email: "jane@example.com",
        role: UserRole.INSTRUCTOR,
      };

      // Act
      const result = await addUserByAdmin(newUserdata);

      // Assert
      expect(result.success).toBe(true);
      expect(result.temporaryPassword).toHaveLength(12);
      expect(mockDbUserFindUnique).toHaveBeenCalledTimes(1);
      expect(mockDbUserFindUnique).toHaveBeenCalledWith({
        where: { email: newUserdata.email },
      });
      expect(mockBcryptHash).toHaveBeenCalledTimes(1);
      expect(mockDbUserCreate).toHaveBeenCalledTimes(1);
      expect(mockRevalidatePath).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if the user already exists", async () => {
      const adminSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      mockDbUserFindUnique.mockResolvedValue({ id: generateMongoId() } as any);
      const newUserdata = {
        name: "Existing User",
        email: "existing@example.com",
        role: UserRole.STUDENT,
      };

      await expect(addUserByAdmin(newUserdata)).rejects.toThrow(
        "A user with this email already exists."
      );
      expect(mockDbUserCreate).not.toHaveBeenCalled();
    });

    it("should throw an error if required fields are missing", async () => {
      const adminSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
      };
      mockGetServerSession.mockResolvedValue(adminSession);

      // Missing name
      const invalidData = {
        name: "",
        email: "test@test.com",
        role: UserRole.STUDENT,
      };

      await expect(addUserByAdmin(invalidData as any)).rejects.toThrow(
        "All fields are required."
      );
    });
  });

  describe("completeUserProfile", () => {
    it("should successfully update a new user's role to STUDENT", async () => {
      // Arrange
      const newUserId = generateMongoId();
      const newUserSession = {
        user: { id: newUserId, role: UserRole.NEW_USER },
      };
      mockGetServerSession.mockResolvedValue(newUserSession as any);
      const chosenRole = UserRole.STUDENT;

      // Act
      const result = await completeUserProfile(chosenRole);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe("Profile updated successfully!");
      expect(mockDbUserUpdate).toHaveBeenCalledTimes(1);
      expect(mockDbUserUpdate).toHaveBeenCalledWith({
        where: { id: newUserId },
        data: { role: chosenRole },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/profile");
    });

    it("should successfully update a new user's role to INSTRUCTOR", async () => {
      // Arrange
      const newUserId = generateMongoId();
      const newUserSession = {
        user: { id: newUserId, role: UserRole.NEW_USER },
      };
      mockGetServerSession.mockResolvedValue(newUserSession as any);
      const chosenRole = UserRole.INSTRUCTOR;

      // Act
      const result = await completeUserProfile(chosenRole);

      // Assert
      expect(result.success).toBe(true);
      expect(mockDbUserUpdate).toHaveBeenCalledTimes(1);
      expect(mockDbUserUpdate).toHaveBeenCalledWith({
        where: { id: newUserId },
        data: { role: chosenRole },
      });
    });

    it("should throw an error if the user is not logged in", async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);

      // Act & Assert
      await expect(completeUserProfile(UserRole.STUDENT)).rejects.toThrow(
        "Unauthorized: You must be logged in."
      );
      expect(mockDbUserUpdate).not.toHaveBeenCalled();
    });

    it("should throw an error if an invalid role is provided", async () => {
      // Arrange
      const newUserId = generateMongoId();
      const newUserSession = {
        user: { id: newUserId, role: UserRole.NEW_USER },
      };
      mockGetServerSession.mockResolvedValue(newUserSession as any);
      const invalidRole = "SOME_INVALID_ROLE" as UserRole;

      // Act & Assert
      await expect(completeUserProfile(invalidRole)).rejects.toThrow(
        "Invalid role selected."
      );
      expect(mockDbUserUpdate).not.toHaveBeenCalled();
    });
  });
});
