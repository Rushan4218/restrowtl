"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import {
  getAverageFeedback,
  getRestaurantReviews,
  getAverageReviewRating,
} from "@/services/feedbackService";
import type { RestaurantReview } from "@/types";

export function FeedbackAnalyticsContent() {
  const [feedbackStats, setFeedbackStats] = useState<any>(null);
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [stats, revs, avgRating] = await Promise.all([
        getAverageFeedback(),
        getRestaurantReviews(),
        getAverageReviewRating(),
      ]);
      setFeedbackStats(stats);
      setReviews(revs);
      setAverageRating(avgRating);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingSpinner />;

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {averageRating.toFixed(1)}
            </div>
            <div className="mt-1">{renderStars(Math.round(averageRating))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Order Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {feedbackStats?.totalReviews || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">total reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Food Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {feedbackStats?.averageFoodQuality?.toFixed(1) || "—"}
            </div>
            <div className="mt-1">
              {feedbackStats?.averageFoodQuality
                ? renderStars(Math.round(feedbackStats.averageFoodQuality))
                : <p className="text-xs text-muted-foreground">No data</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Service Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {feedbackStats?.averageServiceQuality?.toFixed(1) || "—"}
            </div>
            <div className="mt-1">
              {feedbackStats?.averageServiceQuality
                ? renderStars(Math.round(feedbackStats.averageServiceQuality))
                : <p className="text-xs text-muted-foreground">No data</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Reviews</h2>

        {reviews.length === 0 ? (
          <EmptyState
            icon={<Star className="h-10 w-10" />}
            title="No reviews yet"
            description="Customer reviews will appear here once they start rating their experience."
          />
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 10).map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {review.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Food</p>
                      <p className="font-medium text-foreground">
                        {review.categories.food}/5
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Service</p>
                      <p className="font-medium text-foreground">
                        {review.categories.service}/5
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ambiance</p>
                      <p className="font-medium text-foreground">
                        {review.categories.ambiance}/5
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Value</p>
                      <p className="font-medium text-foreground">
                        {review.categories.value}/5
                      </p>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="rounded-lg bg-muted p-2 text-sm text-foreground">
                      "{review.comment}"
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
