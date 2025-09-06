import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  updateUserRole,
  deleteUser,
  addUserByAdmin,
  completeUserProfile,
} from "./user-actions";
import { db } from "@/lib/db";
import { getServerSession, Session } from "next-auth";
import { UserRole, User } from "@prisma/client";
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
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("bcrypt");

// --- Test Suite Setup ---
const mockGetServerSession = vi.mocked(getServerSession);
const mockDbUserUpdate = vi.mocked(db.user.update);
const mockDbUserDelete = vi.mocked(db.user.delete);
const mockDbUserCreate = vi.mocked(db.user.create);
const mockDbUserFindUnique = vi.mocked(db.user.findUnique);
const mockRevalidatePath = vi.mocked(revalidatePath);
const mockBcryptHash = vi.mocked(bcrypt.hash);
const generateMongoId = () => new Types.ObjectId().toHexString();

// --- Define Types for Mock Data ---
type MockSession = Session & { user: { id: string; role: UserRole } };

describe("User Server Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("updateUserRole", () => {
    it("should successfully update a user role when called by an ADMIN", async () => {
      const adminSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      const targetUserId = generateMongoId();
      const newRole = UserRole.INSTRUCTOR;

      const result = await updateUserRole(targetUserId, newRole);

      expect(result.success).toBe(true);
      expect(mockDbUserUpdate).toHaveBeenCalledWith({
        where: { id: targetUserId },
        data: { role: newRole },
      });
    });

    it("should throw an error if called by a non-ADMIN user", async () => {
      const studentSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.STUDENT },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(studentSession);
      await expect(
        updateUserRole(generateMongoId(), UserRole.ADMIN)
      ).rejects.toThrow("Forbidden: Admins only.");
    });

    it("should throw an error if an ADMIN tries to change their own role", async () => {
      const adminId = generateMongoId();
      const adminSession: MockSession = {
        user: { id: adminId, role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      await expect(updateUserRole(adminId, UserRole.STUDENT)).rejects.toThrow(
        "Admins cannot change their own role."
      );
    });
  });

  describe("deleteUser", () => {
    it("should successfully delete a user when called by an ADMIN", async () => {
      const adminSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      const targetUserId = generateMongoId();
      mockDbUserDelete.mockResolvedValue({ name: "Deleted User" } as User);

      const result = await deleteUser(targetUserId);

      expect(result.success).toBe(true);
      expect(result.message).toBe("User Deleted User deleted successfully.");
      expect(mockDbUserDelete).toHaveBeenCalledWith({
        where: { id: targetUserId },
      });
    });

    it("should throw an error if an ADMIN tries to delete themselves", async () => {
      const adminId = generateMongoId();
      const adminSession: MockSession = {
        user: { id: adminId, role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      await expect(deleteUser(adminId)).rejects.toThrow(
        "Admins cannot delete their own account."
      );
    });
  });

  describe("addUserByAdmin", () => {
    it("should successfully create a new user and return a temporary password", async () => {
      const adminSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      mockDbUserFindUnique.mockResolvedValue(null);
      mockBcryptHash.mockResolvedValue("a_long_hashed_password");
      mockDbUserCreate.mockResolvedValue({ name: "Jane Doe" } as User);
      const newUserdata = {
        name: "Jane Doe",
        email: "jane@example.com",
        role: UserRole.INSTRUCTOR,
      };

      const result = await addUserByAdmin(newUserdata);

      expect(result.success).toBe(true);
      expect(result.temporaryPassword).toHaveLength(12);
      expect(mockDbUserFindUnique).toHaveBeenCalledWith({
        where: { email: newUserdata.email },
      });
    });

    it("should throw an error if the user already exists", async () => {
      const adminSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      mockDbUserFindUnique.mockResolvedValue({ id: generateMongoId() } as User);
      const newUserdata = {
        name: "Existing User",
        email: "existing@example.com",
        role: UserRole.STUDENT,
      };

      await expect(addUserByAdmin(newUserdata)).rejects.toThrow(
        "A user with this email already exists."
      );
    });

    it("should throw an error if required fields are missing", async () => {
      const adminSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      const invalidData = {
        name: "",
        email: "test@test.com",
        role: UserRole.STUDENT,
      };

      await expect(addUserByAdmin(invalidData)).rejects.toThrow(
        "All fields are required."
      );
    });
  });

  describe("completeUserProfile", () => {
    it("should successfully update a new user's role to STUDENT", async () => {
      const newUserId = generateMongoId();
      const newUserSession: MockSession = {
        user: { id: newUserId, role: UserRole.NEW_USER },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(newUserSession);
      const chosenRole = UserRole.STUDENT;

      const result = await completeUserProfile(chosenRole);

      expect(result.success).toBe(true);
      expect(mockDbUserUpdate).toHaveBeenCalledWith({
        where: { id: newUserId },
        data: { role: chosenRole },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/profile");
    });

    it("should throw an error if the user is not logged in", async () => {
      mockGetServerSession.mockResolvedValue(null);
      await expect(completeUserProfile(UserRole.STUDENT)).rejects.toThrow(
        "Unauthorized: You must be logged in."
      );
    });

    it("should throw an error if an invalid role is provided", async () => {
      const newUserSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.NEW_USER },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(newUserSession);
      const invalidRole = "SOME_INVALID_ROLE" as UserRole;

      await expect(completeUserProfile(invalidRole)).rejects.toThrow(
        "Invalid role selected."
      );
    });
  });
});
