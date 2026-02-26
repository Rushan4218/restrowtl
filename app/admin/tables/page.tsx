import { TablesContent } from "@/components/admin/tables-content";

export default function TablesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Table Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add and manage restaurant tables, seating capacity, and availability.
        </p>
      </div>
      <TablesContent />
    </div>
  );
}
