import { ServicesOverviewContent } from "@/components/admin/services-overview-content";

export default function ServicesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Services
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure dine-in and delivery services.
        </p>
      </div>
      <ServicesOverviewContent />
    </div>
  );
}
