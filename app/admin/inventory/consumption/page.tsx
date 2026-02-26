import { ConsumptionContent } from "@/components/admin/consumption-content";

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Consumption
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stock consumption is auto-calculated from completed/served/paid orders using each dish recipe (auto-deduction). Manual Consumption is only for wastage, damage, expired stock, staff meals, or manual adjustments (not normal sales).</p>
      </div>
      <ConsumptionContent />
    </div>
  );
}
