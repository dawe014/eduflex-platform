import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  submitContactMessage,
  updateMessageStatus,
  deleteContactMessage,
} from "./contact-actions";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { UserRole, MessageStatus } from "@prisma/client";

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
      // Arrange
      mockGetServerSession.mockResolvedValue(null);

      // Act
      const result = await submitContactMessage(validFormData);

      // Assert
      expect(result.success).toBe(true);
      expect(mockDbContactMessageCreate).toHaveBeenCalledTimes(1);
      // --- CORRECTED ASSERTION ---
      expect(mockDbContactMessageCreate).toHaveBeenCalledWith({
        data: {
          ...validFormData,
          userId: undefined, // Check for undefined, not null
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/messages");
    });

    it("should successfully save a message from a LOGGED-IN USER", async () => {
      // Arrange
      const userId = generateMongoId();
      const userSession = {
        user: { id: userId, name: "Jane Doe", email: "jane@example.com" },
      };
      mockGetServerSession.mockResolvedValue(userSession as any);

      const loggedInFormData = {
        ...validFormData,
        name: "Jane Doe",
        email: "jane@example.com",
      };

      // Act
      const result = await submitContactMessage(loggedInFormData);

      // Assert
      expect(result.success).toBe(true);
      expect(mockDbContactMessageCreate).toHaveBeenCalledTimes(1);
      expect(mockDbContactMessageCreate).toHaveBeenCalledWith({
        data: {
          ...loggedInFormData,
          userId: userId,
        },
      });
    });

    it("should throw an error if form data is invalid", async () => {
      // Arrange
      const invalidFormData = { ...validFormData, message: "Too short" };
      // --- THIS IS THE FIX ---
      // We must still mock a session, even though we're not testing auth here.
      // This prevents the action from crashing before it gets to the validation step.
      const userSession = { user: { id: generateMongoId() } };
      mockGetServerSession.mockResolvedValue(userSession as any);

      // Act & Assert
      await expect(submitContactMessage(invalidFormData)).rejects.toThrow(
        "Message must be at least 10 characters"
      );
      expect(mockDbContactMessageCreate).not.toHaveBeenCalled();
    });
  });

  // --- Test Suite for updateMessageStatus ---
  describe("updateMessageStatus", () => {
    it("should allow an ADMIN to update a message status", async () => {
      // Arrange
      const adminSession = { user: { role: UserRole.ADMIN } } as any;
      mockGetServerSession.mockResolvedValue(adminSession);
      const messageId = generateMongoId();
      const newStatus = MessageStatus.READ;

      // Act
      const result = await updateMessageStatus(messageId, newStatus);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe("Message status updated to READ.");
      expect(mockDbContactMessageUpdate).toHaveBeenCalledTimes(1);
      expect(mockDbContactMessageUpdate).toHaveBeenCalledWith({
        where: { id: messageId },
        data: { status: newStatus },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/messages");
    });

    it("should prevent a non-ADMIN from updating a message status", async () => {
      // Arrange
      const studentSession = { user: { role: UserRole.STUDENT } } as any;
      mockGetServerSession.mockResolvedValue(studentSession);

      // Act & Assert
      await expect(
        updateMessageStatus(generateMongoId(), MessageStatus.ARCHIVED)
      ).rejects.toThrow("Forbidden: Admins only.");
      expect(mockDbContactMessageUpdate).not.toHaveBeenCalled();
    });
  });

  // --- Test Suite for deleteContactMessage ---
  describe("deleteContactMessage", () => {
    it("should allow an ADMIN to delete a message", async () => {
      // Arrange
      const adminSession = { user: { role: UserRole.ADMIN } } as any;
      mockGetServerSession.mockResolvedValue(adminSession);
      const messageId = generateMongoId();
      mockDbContactMessageDelete.mockResolvedValue({} as any);

      // Act
      const result = await deleteContactMessage(messageId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe("Message deleted successfully.");
      expect(mockDbContactMessageDelete).toHaveBeenCalledTimes(1);
      expect(mockDbContactMessageDelete).toHaveBeenCalledWith({
        where: { id: messageId },
      });
    });

    it("should prevent a non-ADMIN from deleting a message", async () => {
      // Arrange
      const instructorSession = { user: { role: UserRole.INSTRUCTOR } } as any;
      mockGetServerSession.mockResolvedValue(instructorSession);

      // Act & Assert
      await expect(deleteContactMessage(generateMongoId())).rejects.toThrow(
        "Forbidden: Admins only."
      );
      expect(mockDbContactMessageDelete).not.toHaveBeenCalled();
    });
  });
});
