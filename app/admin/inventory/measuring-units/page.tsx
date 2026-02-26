import { MeasuringUnitsContent } from "@/components/admin/measuring-units-content";

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Measuring Units
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage units like kilogram, liter, pieces.
        </p>
      </div>
      <MeasuringUnitsContent />
    </div>
  );
}
