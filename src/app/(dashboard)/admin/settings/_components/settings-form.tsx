"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import {
  PlatformSettings,
  updatePlatformSettings,
} from "@/actions/settings-actions";
import { toast } from "sonner";
import { Settings, Loader2 } from "lucide-react";

interface SettingsFormProps {
  initialSettings: PlatformSettings;
}

export const SettingsForm = ({ initialSettings }: SettingsFormProps) => {
  const [settings, setSettings] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();

  const onSave = () => {
    startTransition(async () => {
      try {
        const result = await updatePlatformSettings(settings);
        toast.success(result.message);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          General Settings
        </CardTitle>
        <CardDescription>
          Control global features and access on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-gray-50 border">
          <Label
            htmlFor="new-registrations"
            className="flex flex-col space-y-1 cursor-pointer"
          >
            <span className="font-medium text-gray-900">
              Allow New User Registrations
            </span>
            <span className="text-sm font-normal text-gray-500">
              If disabled, the public registration page will be blocked.
            </span>
          </Label>
          <Switch
            id="new-registrations"
            checked={settings.allowNewRegistrations}
            onCheckedChange={(checked) =>
              setSettings((s) => ({ ...s, allowNewRegistrations: checked }))
            }
          />
        </div>

        <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-gray-50 border">
          <Label
            htmlFor="new-courses"
            className="flex flex-col space-y-1 cursor-pointer"
          >
            <span className="font-medium text-gray-900">
              Allow New Course Submissions
            </span>
            <span className="text-sm font-normal text-gray-500">
              If disabled, instructors will not be able to create new courses.
            </span>
          </Label>
          <Switch
            id="new-courses"
            checked={settings.allowCourseSubmissions}
            onCheckedChange={(checked) =>
              setSettings((s) => ({ ...s, allowCourseSubmissions: checked }))
            }
          />
        </div>

        <div className="text-right pt-4">
          <Button
            onClick={onSave}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
