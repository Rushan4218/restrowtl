"use client";

import { AlertCircle } from "lucide-react";
import { MenuContent } from "@/components/customer/menu-content";
import { useTable } from "@/hooks/use-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MenuPage() {
  const { tableLoading, tableError, selectedTable, isTableLocked } = useTable();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Our Menu
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse our selection and add items to your cart.
        </p>
      </div>

      {tableLoading && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Validating table QR code...
        </div>
      )}

      {tableError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid QR Code</AlertTitle>
          <AlertDescription>
            {tableError} Please ask your server for assistance or select a table manually when ordering.
          </AlertDescription>
        </Alert>
      )}

      {isTableLocked && selectedTable && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
          You are ordering for <strong>{selectedTable.name}</strong> (seats {selectedTable.capacity}). Table is locked via QR code.
        </div>
      )}

      <MenuContent />
    </div>
  );
}
