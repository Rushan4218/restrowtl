import { ComboOffersContent } from "@/components/admin/combo-offers-content";

export default function ComboOffersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Combo Offers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage combo bundles and special offers.
        </p>
      </div>
      <ComboOffersContent />
    </div>
  );
}
