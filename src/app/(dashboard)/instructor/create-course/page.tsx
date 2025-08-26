// File: src/app/(dashboard)/instructor/create-course/page.tsx
import { createCourse } from "@/actions/course-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const CreateCoursePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create a New Course</CardTitle>
          <CardDescription>
            What would you like to name your course? Don&apos;t worry, you can
            change this later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCourse}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. 'Advanced Next.js Development'"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This will be the main title of your course.
                </p>
              </div>
              <div className="flex items-center gap-x-2">
                <Button asChild variant="ghost">
                  <Link href="/instructor/dashboard">Cancel</Link>
                </Button>
                <Button type="submit">Continue</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCoursePage;
