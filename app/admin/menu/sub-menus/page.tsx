import { SubMenusContent } from "@/components/admin/sub-menus-content";

export default function SubMenusPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Sub Menus
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create sub-menus to group categories.
        </p>
      </div>
      <SubMenusContent />
    </div>
  );
}
