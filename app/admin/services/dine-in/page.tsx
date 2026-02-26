import { DineInService } from "@/components/admin/dine-in-service";

export default function DineInPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Dine In Service
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure dining experience settings and operational features.
        </p>
      </div>
      <DineInService />
    </div>
  );
}
