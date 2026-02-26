import { InventoryDashboardContent } from "@/components/admin/inventory-dashboard-content";

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Inventory Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track stock value, restocks, low stock, and usage trends.
        </p>
      </div>
      <InventoryDashboardContent />
    </div>
  );
}
