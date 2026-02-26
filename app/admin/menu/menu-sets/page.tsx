import { MenuSetsContent } from "@/components/admin/menu-sets-content";

export default function MenuSetsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Menu Sets
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create sets for different meal times like breakfast, lunch, and dinner.
        </p>
      </div>
      <MenuSetsContent />
    </div>
  );
}
