import { SuppliersContent } from "@/components/admin/suppliers-content";

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Suppliers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Maintain supplier info and ledger-style balances.
        </p>
      </div>
      <SuppliersContent />
    </div>
  );
}
