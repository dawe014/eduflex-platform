import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default async function AdminSettingsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Platform Settings</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="new-registrations"
              className="flex flex-col space-y-1"
            >
              <span>Allow New User Registrations</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Disable this to prevent new users from signing up.
              </span>
            </Label>
            <Switch id="new-registrations" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="new-courses" className="flex flex-col space-y-1">
              <span>Allow New Course Submissions</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Disable this to prevent instructors from creating new courses.
              </span>
            </Label>
            <Switch id="new-courses" defaultChecked />
          </div>
          <div className="text-right">
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
