import { StockItemsContent } from "@/components/admin/stock-items-content";

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Stock Items
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create items, opening stock, restocks, valuations, and alerts.
        </p>
      </div>
      <StockItemsContent />
    </div>
  );
}
