import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminModerationPage() {
  // TODO: Fetch reported reviews, courses, etc.

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Content Moderation</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moderation Queue</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-2" />
            <p>Content moderation queue is empty. Good job!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
