// Admin menu page - manage dishes and items
import { MenuIndexContent } from "@/components/admin/menu-index-content";

export default function MenuPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Menu - Dishes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all dishes and items in your restaurant menu.
        </p>
      </div>
      <MenuIndexContent />
    </div>
  );
}
