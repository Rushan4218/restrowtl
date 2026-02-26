import { Suspense } from "react";
import { OrderConfirmationContent } from "@/components/customer/order-confirmation-content";
import { LoadingSpinner } from "@/components/shared/loading-state";

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
