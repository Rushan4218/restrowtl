import { StockHistoryContent } from "@/components/admin/stock-history-content";

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Stock History
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View movements across opening, restock, consumption, adjustments.
        </p>
      </div>
      <StockHistoryContent />
    </div>
  );
}
