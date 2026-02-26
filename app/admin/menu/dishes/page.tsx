import { DishesContent } from "@/components/admin/dishes-content";

export default function DishesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Dishes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your menu dishes, pricing, and availability.
        </p>
      </div>
      <DishesContent />
    </div>
  );
}
