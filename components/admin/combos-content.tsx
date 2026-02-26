"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus, Trash2, Edit2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingCards } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { getCombos, toggleComboStatus, deleteCombo } from "@/services/combosService";
import type { ComboOffer } from "@/types";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export function CombosContent() {
  const [combos, setCombos] = useState<ComboOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    try {
      const data = await getCombos();
      setCombos(data);
    } catch (error) {
      toast.error("Failed to load combo offers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCombos = combos.filter(
    (combo) =>
      search === "" ||
      combo.name.toLowerCase().includes(search.toLowerCase()) ||
      combo.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCombos.length / ITEMS_PER_PAGE);
  const paginatedCombos = filteredCombos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await toggleComboStatus(id);
      setCombos(combos.map((c) => (c.id === id ? updated : c)));
      toast.success("Combo updated");
    } catch (error) {
      toast.error("Failed to update combo");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this combo?")) return;
    try {
      await deleteCombo(id);
      setCombos(combos.filter((c) => c.id !== id));
      toast.success("Combo deleted");
    } catch (error) {
      toast.error("Failed to delete combo");
    }
  };

  const calculateSavings = (basePrice: number, discountPrice: number) => {
    return (((basePrice - discountPrice) / basePrice) * 100).toFixed(0);
  };

  if (loading) return <LoadingCards count={6} />;

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search combos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Combo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Combos</p>
          <p className="text-2xl font-bold text-foreground mt-1">{combos.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {combos.filter((c) => c.isActive).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Savings Value</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            ${combos
              .reduce((sum, c) => sum + (c.basePrice - c.discountPrice), 0)
              .toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Table */}
      {filteredCombos.length === 0 ? (
        <EmptyState
          title="No combo offers found"
          description="Create your first combo to offer special bundle deals"
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Combo Name</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Items</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Base Price</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Combo Price</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Savings</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCombos.map((combo) => (
                  <tr key={combo.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{combo.name}</p>
                        {combo.description && (
                          <p className="text-xs text-muted-foreground">{combo.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium">
                      {combo.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      ${combo.basePrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      ${combo.discountPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="secondary" className="gap-1">
                        <DollarSign className="h-3 w-3" />
                        {calculateSavings(combo.basePrice, combo.discountPrice)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={combo.isActive ? "default" : "secondary"}>
                        {combo.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(combo.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(combo.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
