import { Suspense } from "react";
import { CartProvider } from "@/hooks/use-cart";
import { TableProvider } from "@/hooks/use-table";
import { AuthProvider } from "@/hooks/use-auth";
import { DeviceSessionProvider } from "@/hooks/use-device-session";
import { CustomerHeader } from "@/components/customer/customer-header";
import { BellStatusDisplay } from "@/components/customer/bell-status-display";

function MenuLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TableProvider>
        <DeviceSessionProvider>
          <CartProvider>
            <div className="min-h-screen bg-background">
              <CustomerHeader />
              <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
                <BellStatusDisplay />
                {children}
              </main>
            </div>
          </CartProvider>
        </DeviceSessionProvider>
      </TableProvider>
    </AuthProvider>
  );
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <MenuLayoutInner>{children}</MenuLayoutInner>
    </Suspense>
  );
}
