import { CustomerListContent } from "@/components/admin/customer-management/customer-list-content";

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Customer List
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage registered customers, filter by dynamic attributes, and keep profiles ready for fast order creation.
        </p>
      </div>

      <CustomerListContent />
    </div>
  );
}
