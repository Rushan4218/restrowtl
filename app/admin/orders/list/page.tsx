import { AdminNavbar } from "@/components/admin/admin-navbar";
import { OrderListContent } from "@/components/admin/order-list-content";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavbar
        title="Order List"
        subtitle="View, manage and update all orders"
        action={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        }
      />
      <div className="flex-1 px-4 md:px-6 lg:px-8">
        <OrderListContent />
      </div>
    </div>
  );
}

