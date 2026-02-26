import { CategoriesContent } from "@/components/admin/categories-content";

export default function CategoriesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Categories
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Organize your menu into categories for better navigation.
        </p>
      </div>
      <CategoriesContent />
    </div>
  );
}
