"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { submitOrderFeedback } from "@/services/feedbackService";
import type { Order } from "@/types";

interface OrderFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  customerId: string;
}

export function OrderFeedbackModal({
  open,
  onOpenChange,
  order,
  customerId,
}: OrderFeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [foodQuality, setFoodQuality] = useState(0);
  const [hoverFoodQuality, setHoverFoodQuality] = useState(0);
  const [serviceQuality, setServiceQuality] = useState(0);
  const [hoverServiceQuality, setHoverServiceQuality] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please provide an overall rating");
      return;
    }

    setSubmitting(true);
    try {
      await submitOrderFeedback({
        orderId: order.id,
        customerId,
        rating,
        foodQuality: foodQuality || undefined,
        serviceQuality: serviceQuality || undefined,
        comment: comment.trim() || undefined,
      });
      toast.success("Thank you for your feedback!");
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setFoodQuality(0);
    setServiceQuality(0);
    setComment("");
  };

  const StarRating = ({
    label,
    value,
    hoverValue,
    onHover,
    onLeave,
    onRate,
  }: {
    label: string;
    value: number;
    hoverValue: number;
    onHover: (val: number) => void;
    onLeave: () => void;
    onRate: (val: number) => void;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={onLeave}
            className="outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoverValue || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {value > 0 ? `${value} out of 5` : "Click to rate"}
      </p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rate Your Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Order {order.id.slice(-4).toUpperCase()} • {order.tableName}
            </p>
            <div className="mt-2 space-y-1">
              {order.items.slice(0, 2).map((item, idx) => (
                <p key={idx} className="text-sm">
                  {item.quantity}x {item.productName}
                </p>
              ))}
              {order.items.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{order.items.length - 2} more items
                </p>
              )}
            </div>
          </div>

          <StarRating
            label="Overall Rating"
            value={rating}
            hoverValue={hoverRating}
            onHover={setHoverRating}
            onLeave={() => setHoverRating(0)}
            onRate={setRating}
          />

          <StarRating
            label="Food Quality"
            value={foodQuality}
            hoverValue={hoverFoodQuality}
            onHover={setHoverFoodQuality}
            onLeave={() => setHoverFoodQuality(0)}
            onRate={setFoodQuality}
          />

          <StarRating
            label="Service Quality"
            value={serviceQuality}
            hoverValue={hoverServiceQuality}
            onHover={setHoverServiceQuality}
            onLeave={() => setHoverServiceQuality(0)}
            onRate={setServiceQuality}
          />

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Additional Comments <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
