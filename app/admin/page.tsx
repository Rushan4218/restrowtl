import { DashboardContent } from "@/components/admin/dashboard-content";

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your restaurant operations.
        </p>
      </div>
      <DashboardContent />
    </div>
  );
}
