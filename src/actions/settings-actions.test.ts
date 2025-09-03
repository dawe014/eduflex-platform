import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "./settings-actions";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { UserRole } from "@prisma/client";

// --- Mocking All External Dependencies ---
vi.mock("next-auth");
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    setting: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    // Mock the $transaction function
    $transaction: vi.fn(async (promises) => await Promise.all(promises)),
  },
}));

// --- Test Suite Setup ---
const mockGetServerSession = vi.mocked(getServerSession);
const mockDbSettingFindMany = vi.mocked(db.setting.findMany);
const mockDbSettingUpsert = vi.mocked(db.setting.upsert);
const mockDbTransaction = vi.mocked(db.$transaction);
const mockRevalidatePath = vi.mocked(revalidatePath);

const generateMongoId = () => new Types.ObjectId().toHexString();

// Main test suite for all settings-related actions
describe("Settings Server Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // --- Test Suite for getPlatformSettings ---
  describe("getPlatformSettings", () => {
    it("should return default settings when the database is empty", async () => {
      // Arrange
      mockDbSettingFindMany.mockResolvedValue([]);

      // Act
      const settings = await getPlatformSettings();

      // Assert
      expect(settings).toEqual({
        allowNewRegistrations: true,
        allowCourseSubmissions: true,
      });
      expect(mockDbSettingFindMany).toHaveBeenCalledTimes(1);
    });

    it("should return settings from the database, overriding defaults", async () => {
      // Arrange
      const dbData = [
        { id: generateMongoId(), key: "allowNewRegistrations", value: false },
      ];
      mockDbSettingFindMany.mockResolvedValue(dbData);

      // Act
      const settings = await getPlatformSettings();

      // Assert
      expect(settings).toEqual({
        allowNewRegistrations: false,
        allowCourseSubmissions: true,
      });
    });

    it("should correctly merge multiple database settings with defaults", async () => {
      // Arrange
      const dbData = [
        { id: generateMongoId(), key: "allowNewRegistrations", value: false },
        { id: generateMongoId(), key: "allowCourseSubmissions", value: false },
      ];
      mockDbSettingFindMany.mockResolvedValue(dbData);

      // Act
      const settings = await getPlatformSettings();

      // Assert
      expect(settings).toEqual({
        allowNewRegistrations: false,
        allowCourseSubmissions: false,
      });
    });
  });

  // --- Test Suite for updatePlatformSettings ---
  describe("updatePlatformSettings", () => {
    it("should allow an ADMIN to update platform settings", async () => {
      // Arrange
      const adminSession = { user: { role: UserRole.ADMIN } } as any;
      mockGetServerSession.mockResolvedValue(adminSession);
      const newSettings = { allowNewRegistrations: false };

      // Act
      const result = await updatePlatformSettings(newSettings);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe("Settings updated successfully.");

      // Check that upsert was called for the provided setting
      expect(mockDbSettingUpsert).toHaveBeenCalledTimes(1);
      expect(mockDbSettingUpsert).toHaveBeenCalledWith({
        where: { key: "allowNewRegistrations" },
        update: { value: false },
        create: { key: "allowNewRegistrations", value: false },
      });

      // Check that the transaction was called
      expect(mockDbTransaction).toHaveBeenCalledTimes(1);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/settings");
    });

    it("should prevent a non-ADMIN from updating settings", async () => {
      // Arrange
      const studentSession = { user: { role: UserRole.STUDENT } } as any;
      mockGetServerSession.mockResolvedValue(studentSession);
      const newSettings = { allowCourseSubmissions: false };

      // Act & Assert
      await expect(updatePlatformSettings(newSettings)).rejects.toThrow(
        "Forbidden: This action is restricted to administrators."
      );
      expect(mockDbSettingUpsert).not.toHaveBeenCalled();
      expect(mockDbTransaction).not.toHaveBeenCalled();
    });

    it("should handle updating multiple settings at once", async () => {
      // Arrange
      const adminSession = { user: { role: UserRole.ADMIN } } as any;
      mockGetServerSession.mockResolvedValue(adminSession);
      const newSettings = {
        allowNewRegistrations: false,
        allowCourseSubmissions: false,
      };

      // Act
      await updatePlatformSettings(newSettings);

      // Assert
      expect(mockDbSettingUpsert).toHaveBeenCalledTimes(2);
      expect(mockDbTransaction).toHaveBeenCalledTimes(1);
      expect(mockDbTransaction).toHaveBeenCalledWith(expect.any(Array));
    });
  });
});
