import { ProductsContent } from "@/components/admin/products-content";

export default function ProductsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Products
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your menu products, pricing, and availability.
        </p>
      </div>
      <ProductsContent />
    </div>
  );
}
