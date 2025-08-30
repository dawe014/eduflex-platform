"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface NotificationSettingsFormProps {
  initialSettings: {
    marketingEmails?: boolean;
    courseUpdates?: boolean;
  };
}

export const NotificationSettingsForm = ({
  initialSettings,
}: NotificationSettingsFormProps) => {
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/profile/notifications", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      toast.success("Notification settings saved!");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 max-w-2xl">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="marketing-emails">Receive marketing emails</Label>
            <Switch
              id="marketing-emails"
              checked={settings.marketingEmails}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, marketingEmails: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="course-updates">
              Get notified about course updates
            </Label>
            <Switch
              id="course-updates"
              checked={settings.courseUpdates}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, courseUpdates: checked }))
              }
            />
          </div>
          <div className="text-right">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
