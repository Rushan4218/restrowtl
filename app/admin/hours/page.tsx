import { BusinessHoursContent } from "@/components/admin/business-hours-content";

export default function BusinessHoursPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Business Hours
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your restaurant operating hours for each day of the week.
        </p>
      </div>
      <BusinessHoursContent />
    </div>
  );
}
