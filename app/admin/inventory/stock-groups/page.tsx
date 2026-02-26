import { StockGroupsContent } from "@/components/admin/stock-groups-content";

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Stock Groups
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Group inventory items (Drinks, Groceries, Meat, Vegetables, Others).
        </p>
      </div>
      <StockGroupsContent />
    </div>
  );
}
