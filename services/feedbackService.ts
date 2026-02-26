import type { OrderFeedback, RestaurantReview } from "@/types";
import { simulateDelay, generateId } from "./api";

const FEEDBACK_KEY = "restrohub_order_feedback";
const REVIEWS_KEY = "restrohub_restaurant_reviews";

function getStoredFeedback(): OrderFeedback[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(FEEDBACK_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveFeedback(feedback: OrderFeedback[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
}

function getStoredReviews(): RestaurantReview[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(REVIEWS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveReviews(reviews: RestaurantReview[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

export async function submitOrderFeedback(
  feedback: Omit<OrderFeedback, "id" | "createdAt">
): Promise<OrderFeedback> {
  await simulateDelay();
  const feedbackList = getStoredFeedback();
  const newFeedback: OrderFeedback = {
    ...feedback,
    id: generateId("fb"),
    createdAt: new Date().toISOString(),
  };
  feedbackList.push(newFeedback);
  saveFeedback(feedbackList);
  return newFeedback;
}

export async function getOrderFeedback(orderId: string): Promise<OrderFeedback | undefined> {
  await simulateDelay();
  const feedback = getStoredFeedback();
  return feedback.find((f) => f.orderId === orderId);
}

export async function getAverageFeedback(): Promise<{
  averageRating: number;
  averageFoodQuality: number;
  averageServiceQuality: number;
  totalReviews: number;
}> {
  await simulateDelay();
  const feedback = getStoredFeedback();
  if (feedback.length === 0) {
    return {
      averageRating: 0,
      averageFoodQuality: 0,
      averageServiceQuality: 0,
      totalReviews: 0,
    };
  }

  const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
  const totalFoodQuality = feedback.reduce((sum, f) => sum + (f.foodQuality || 0), 0);
  const totalServiceQuality = feedback.reduce((sum, f) => sum + (f.serviceQuality || 0), 0);

  return {
    averageRating: Math.round((totalRating / feedback.length) * 10) / 10,
    averageFoodQuality: Math.round((totalFoodQuality / feedback.length) * 10) / 10,
    averageServiceQuality: Math.round((totalServiceQuality / feedback.length) * 10) / 10,
    totalReviews: feedback.length,
  };
}

export async function submitRestaurantReview(
  review: Omit<RestaurantReview, "id" | "createdAt">
): Promise<RestaurantReview> {
  await simulateDelay();
  const reviews = getStoredReviews();
  const newReview: RestaurantReview = {
    ...review,
    id: generateId("rev"),
    createdAt: new Date().toISOString(),
  };
  reviews.push(newReview);
  saveReviews(reviews);
  return newReview;
}

export async function getRestaurantReviews(): Promise<RestaurantReview[]> {
  await simulateDelay();
  return getStoredReviews().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getAverageReviewRating(): Promise<number> {
  await simulateDelay();
  const reviews = getStoredReviews();
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}
