"use client"; // This component now uses a client component (modal), so it must be a client component itself.

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReportReviewModal } from "./report-review-modal"; // Import the new modal
import { useSession } from "next-auth/react"; // Import useSession to conditionally show the report button

// Define a more complete type for reviews with user info
type ReviewWithUser = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
};

interface ReviewsProps {
  reviews: ReviewWithUser[];
}

export const Reviews = ({ reviews }: ReviewsProps) => {
  const { data: session } = useSession(); // Get the current user's session

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
      : 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>

        {/* Rating Summary Section */}
        {totalReviews > 0 && (
          <div className="flex flex-col md:flex-row items-start gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="text-center w-full md:w-auto">
              <div className="text-4xl font-bold text-gray-900">
                {avgRating.toFixed(1)}
              </div>
              <div className="flex justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(avgRating) // Use Math.round for a more intuitive fill
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter(
                  (r) => Math.round(r.rating) === stars
                ).length;
                const percentage =
                  totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="w-16 text-sm text-gray-600 flex items-center gap-1">
                      {stars} <Star className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-amber-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-8 text-sm text-gray-600 text-right">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Individual Reviews List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex gap-4 p-4 border-b last:border-b-0"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={review.user.image || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {review.user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {review.user.name || "Anonymous"}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
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
                      <span className="text-sm text-gray-500">
                        • {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {/* Conditionally render the report button only if a user is logged in */}
                  {session && <ReportReviewModal reviewId={review.id} />}
                </div>
                <p className="text-gray-700 mt-3">{review.comment}</p>
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>No reviews yet. Be the first to review this course!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
