import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  submitContactMessage,
  updateMessageStatus,
  deleteContactMessage,
} from "./contact-actions";
import { db } from "@/lib/db";
import { getServerSession, Session } from "next-auth";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { UserRole, MessageStatus, ContactMessage } from "@prisma/client";

// --- Mocking All External Dependencies ---
vi.mock("next-auth");
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    contactMessage: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// --- Test Suite Setup ---
const mockGetServerSession = vi.mocked(getServerSession);
const mockDbContactMessageCreate = vi.mocked(db.contactMessage.create);
const mockDbContactMessageUpdate = vi.mocked(db.contactMessage.update);
const mockDbContactMessageDelete = vi.mocked(db.contactMessage.delete);
const mockRevalidatePath = vi.mocked(revalidatePath);

const generateMongoId = () => new Types.ObjectId().toHexString();

// --- Define Types for Mock Data ---
type MockSession = Session & {
  user: { id: string; role?: UserRole; name?: string; email?: string };
};

describe("Contact Server Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("submitContactMessage", () => {
    const validFormData = {
      name: "John Doe",
      email: "john@example.com",
      subject: "Test Inquiry",
      message: "This is a test message with enough characters.",
    };

    it("should successfully save a message from a GUEST", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await submitContactMessage(validFormData);

      expect(result.success).toBe(true);
      expect(mockDbContactMessageCreate).toHaveBeenCalledTimes(1);
      expect(mockDbContactMessageCreate).toHaveBeenCalledWith({
        data: { ...validFormData, userId: undefined },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/messages");
    });

    it("should successfully save a message from a LOGGED-IN USER", async () => {
      const userId = generateMongoId();
      const userSession: MockSession = {
        user: { id: userId, name: "Jane Doe", email: "jane@example.com" },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(userSession);

      const loggedInFormData = {
        ...validFormData,
        name: "Jane Doe",
        email: "jane@example.com",
      };
      const result = await submitContactMessage(loggedInFormData);

      expect(result.success).toBe(true);
      expect(mockDbContactMessageCreate).toHaveBeenCalledWith({
        data: { ...loggedInFormData, userId: userId },
      });
    });

    it("should throw an error if form data is invalid", async () => {
      const invalidFormData = { ...validFormData, message: "Too short" };
      const userSession: MockSession = {
        user: { id: generateMongoId() },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(userSession);

      await expect(submitContactMessage(invalidFormData)).rejects.toThrow(
        "Message must be at least 10 characters"
      );
      expect(mockDbContactMessageCreate).not.toHaveBeenCalled();
    });
  });

  describe("updateMessageStatus", () => {
    it("should allow an ADMIN to update a message status", async () => {
      const adminSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      const messageId = generateMongoId();
      const newStatus = MessageStatus.READ;

      const result = await updateMessageStatus(messageId, newStatus);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Message status updated to READ.");
      expect(mockDbContactMessageUpdate).toHaveBeenCalledWith({
        where: { id: messageId },
        data: { status: newStatus },
      });
    });

    it("should prevent a non-ADMIN from updating a message status", async () => {
      const studentSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.STUDENT },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(studentSession);

      await expect(
        updateMessageStatus(generateMongoId(), MessageStatus.ARCHIVED)
      ).rejects.toThrow("Forbidden: Admins only.");
      expect(mockDbContactMessageUpdate).not.toHaveBeenCalled();
    });
  });

  describe("deleteContactMessage", () => {
    it("should allow an ADMIN to delete a message", async () => {
      const adminSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      const messageId = generateMongoId();
      mockDbContactMessageDelete.mockResolvedValue({} as ContactMessage);

      const result = await deleteContactMessage(messageId);

      expect(result.success).toBe(true);
      expect(mockDbContactMessageDelete).toHaveBeenCalledWith({
        where: { id: messageId },
      });
    });

    it("should prevent a non-ADMIN from deleting a message", async () => {
      const instructorSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.INSTRUCTOR },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(instructorSession);

      await expect(deleteContactMessage(generateMongoId())).rejects.toThrow(
        "Forbidden: Admins only."
      );
      expect(mockDbContactMessageDelete).not.toHaveBeenCalled();
    });
  });
});
