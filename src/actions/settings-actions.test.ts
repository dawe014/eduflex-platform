import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "./settings-actions";
import { db } from "@/lib/db";
import { getServerSession, Session } from "next-auth";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { UserRole, Setting } from "@prisma/client";

// --- Mocking All External Dependencies ---
vi.mock("next-auth");
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    setting: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
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

// --- Define Types for Mock Data ---
type MockSession = Session & { user: { id: string; role: UserRole } };
type MockSetting = Partial<Setting>;

describe("Settings Server Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getPlatformSettings", () => {
    it("should return default settings when the database is empty", async () => {
      mockDbSettingFindMany.mockResolvedValue([]);

      const settings = await getPlatformSettings();

      expect(settings).toEqual({
        allowNewRegistrations: true,
        allowCourseSubmissions: true,
      });
    });

    it("should return settings from the database, overriding defaults", async () => {
      const dbData: MockSetting[] = [
        { id: generateMongoId(), key: "allowNewRegistrations", value: false },
      ];
      mockDbSettingFindMany.mockResolvedValue(dbData as Setting[]);

      const settings = await getPlatformSettings();

      expect(settings).toEqual({
        allowNewRegistrations: false,
        allowCourseSubmissions: true,
      });
    });

    it("should correctly merge multiple database settings with defaults", async () => {
      const dbData: MockSetting[] = [
        { id: generateMongoId(), key: "allowNewRegistrations", value: false },
        { id: generateMongoId(), key: "allowCourseSubmissions", value: false },
      ];
      mockDbSettingFindMany.mockResolvedValue(dbData as Setting[]);

      const settings = await getPlatformSettings();

      expect(settings).toEqual({
        allowNewRegistrations: false,
        allowCourseSubmissions: false,
      });
    });
  });

  describe("updatePlatformSettings", () => {
    it("should allow an ADMIN to update platform settings", async () => {
      const adminSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      const newSettings = { allowNewRegistrations: false };

      const result = await updatePlatformSettings(newSettings);

      expect(result.success).toBe(true);
      expect(mockDbSettingUpsert).toHaveBeenCalledTimes(1);
      expect(mockDbSettingUpsert).toHaveBeenCalledWith({
        where: { key: "allowNewRegistrations" },
        update: { value: false },
        create: { key: "allowNewRegistrations", value: false },
      });
      expect(mockDbTransaction).toHaveBeenCalledTimes(1);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/settings");
    });

    it("should prevent a non-ADMIN from updating settings", async () => {
      const studentSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.STUDENT },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(studentSession);
      const newSettings = { allowCourseSubmissions: false };

      await expect(updatePlatformSettings(newSettings)).rejects.toThrow(
        "Forbidden: This action is restricted to administrators."
      );
      expect(mockDbSettingUpsert).not.toHaveBeenCalled();
    });

    it("should handle updating multiple settings at once", async () => {
      const adminSession: MockSession = {
        user: { id: generateMongoId(), role: UserRole.ADMIN },
        expires: new Date().toISOString(),
      };
      mockGetServerSession.mockResolvedValue(adminSession);
      const newSettings = {
        allowNewRegistrations: false,
        allowCourseSubmissions: false,
      };

      await updatePlatformSettings(newSettings);

      expect(mockDbSettingUpsert).toHaveBeenCalledTimes(2);
      expect(mockDbTransaction).toHaveBeenCalledTimes(1);
    });
  });
});
