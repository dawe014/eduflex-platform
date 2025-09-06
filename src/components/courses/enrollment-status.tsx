"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { EnrollButton } from "./enroll-button";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

interface EnrollmentStatusProps {
  courseId: string;
  isEnrolled: boolean;
}

export const EnrollmentStatus = ({
  courseId,
  isEnrolled,
}: EnrollmentStatusProps) => {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <Button className="w-full" disabled>
        Loading...
      </Button>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Button asChild className="w-full">
        <Link href="/login">Login to Enroll</Link>
      </Button>
    );
  }

  // User is authenticated
  if (isEnrolled) {
    return (
      <Button asChild className="w-full bg-sky-600 hover:bg-sky-700">
        <Link href={`/courses/${courseId}/learn`}>
          Go to Course <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    );
  }

  // User is authenticated but not enrolled
  return <EnrollButton courseId={courseId} />;
};
