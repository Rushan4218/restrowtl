"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { getTableByToken } from "@/services/tableService";
import type { RestaurantTable } from "@/types";

interface TableContextValue {
  selectedTable: RestaurantTable | null;
  isTableLocked: boolean;
  tableLoading: boolean;
  tableError: string | null;
}

const TableContext = createContext<TableContextValue>({
  selectedTable: null,
  isTableLocked: false,
  tableLoading: false,
  tableError: null,
});

export function TableProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("table");

  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(
    null
  );
  const [isTableLocked, setIsTableLocked] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setSelectedTable(null);
      setIsTableLocked(false);
      setTableError(null);
      return;
    }

    let cancelled = false;
    setTableLoading(true);
    setTableError(null);

    getTableByToken(token)
      .then((table) => {
        if (cancelled) return;
        if (table) {
          setSelectedTable(table);
          setIsTableLocked(true);
        } else {
          setTableError("Invalid or disabled table QR code.");
          setSelectedTable(null);
          setIsTableLocked(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setTableError("Failed to validate table.");
      })
      .finally(() => {
        if (!cancelled) setTableLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <TableContext.Provider
      value={{ selectedTable, isTableLocked, tableLoading, tableError }}
    >
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  return useContext(TableContext);
}
