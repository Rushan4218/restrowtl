import AdminSidebarWrapper from "@/components/admin/admin-sidebar-wrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebarWrapper />
      <main className="pt-14 md:ml-64 md:pt-0">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
