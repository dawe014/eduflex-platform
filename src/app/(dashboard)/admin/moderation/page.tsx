import { Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { ModerationActions } from "./_components/moderation-actions";

export default async function AdminModerationPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN")
    return redirect("/dashboard");

  // Fetch all reviews that have been flagged for moderation
  const reportedReviews = await db.review.findMany({
    where: { isReported: true },
    include: {
      user: { select: { name: true, image: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-red-100 rounded-lg">
          <Shield className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Content Moderation
          </h1>
          <p className="text-gray-600">Review content reported by users</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Moderation Queue</CardTitle>
          <CardDescription>
            {reportedReviews.length} item(s) require your review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportedReviews.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-2" />
                <p>The moderation queue is empty. Good job!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {reportedReviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start justify-between">
                    <div>
                      <Badge variant="destructive" className="mb-2">
                        Reported Review
                      </Badge>
                      <p className="text-sm font-semibold text-gray-800">
                        Course:{" "}
                        <span className="font-normal">
                          {review.course.title}
                        </span>
                      </p>
                      <div className="flex items-center gap-x-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={review.user.image || ""} />
                          <AvatarFallback>
                            {review.user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">
                          {review.user.name}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <ModerationActions reviewId={review.id} />
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 italic">
                      "{review.comment || "No comment provided."}"
                    </p>
                    <p className="text-xs text-red-600 mt-2 font-semibold">
                      Reason for report:{" "}
                      <span className="font-normal">{review.reportReason}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
