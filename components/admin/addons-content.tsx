"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingCards } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { getAddOns, toggleAddOnAvailability, deleteAddOn } from "@/services/addonsService";
import type { AddOn } from "@/types";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export function AddOnsContent() {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    try {
      const data = await getAddOns();
      setAddOns(data);
    } catch (error) {
      toast.error("Failed to load add-ons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addonCategories = [...new Set(addOns.map((a) => a.category))];

  const filteredAddOns = addOns.filter((addon) => {
    const matchesSearch =
      search === "" || addon.name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "all" || addon.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredAddOns.length / ITEMS_PER_PAGE);
  const paginatedAddOns = filteredAddOns.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleToggleAvailability = async (id: string) => {
    try {
      const updated = await toggleAddOnAvailability(id);
      setAddOns(addOns.map((a) => (a.id === id ? updated : a)));
      toast.success("Add-on updated");
    } catch (error) {
      toast.error("Failed to update add-on");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this add-on?")) return;
    try {
      await deleteAddOn(id);
      setAddOns(addOns.filter((a) => a.id !== id));
      toast.success("Add-on deleted");
    } catch (error) {
      toast.error("Failed to delete add-on");
    }
  };

  if (loading) return <LoadingCards count={6} />;

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search add-ons..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {addonCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Add-on
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Add-ons</p>
          <p className="text-2xl font-bold text-foreground mt-1">{addOns.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {addOns.filter((a) => a.isAvailable).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Unavailable</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {addOns.filter((a) => !a.isAvailable).length}
          </p>
        </Card>
      </div>

      {/* Table */}
      {filteredAddOns.length === 0 ? (
        <EmptyState
          title="No add-ons found"
          description="Create your first add-on to offer optional extras"
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Add-on Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Price</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAddOns.map((addon) => (
                  <tr key={addon.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{addon.name}</p>
                        {addon.description && (
                          <p className="text-xs text-muted-foreground">{addon.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <Badge variant="outline">
                        {addon.category.charAt(0).toUpperCase() + addon.category.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      ${addon.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={addon.isAvailable ? "default" : "secondary"}>
                        {addon.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAvailability(addon.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(addon.id)}
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
