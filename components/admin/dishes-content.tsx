"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus, Trash2, Edit2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingCards } from "@/components/shared/loading-state";
import { 
  AdminHeader, 
  AdminCard, 
  AdminBadge, 
  AdminEmptyState,
  AdminActionButton,
  AdminTableHeader,
  AdminTableCell,
  AdminTableRow,
} from "@/components/admin/shared/admin-components";
import { getDishes, toggleDishAvailability, searchDishes, deleteDish } from "@/services/dishService";
import { getCategories } from "@/services/categoryService";
import type { Product, Category } from "@/types";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export function DishesContent() {
  const [dishes, setDishes] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    try {
      const [dishesData, categoriesData] = await Promise.all([
        getDishes(),
        getCategories(),
      ]);
      setDishes(dishesData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Failed to load dishes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch =
      search === "" ||
      dish.name.toLowerCase().includes(search.toLowerCase()) ||
      dish.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || dish.categoryId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredDishes.length / ITEMS_PER_PAGE);
  const paginatedDishes = filteredDishes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleToggleAvailability = async (id: string) => {
    try {
      const updated = await toggleDishAvailability(id);
      setDishes(dishes.map((d) => (d.id === id ? updated : d)));
      toast.success("Dish updated");
    } catch (error) {
      toast.error("Failed to update dish");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;
    try {
      await deleteDish(id);
      setDishes(dishes.filter((d) => d.id !== id));
      toast.success("Dish deleted");
    } catch (error) {
      toast.error("Failed to delete dish");
    }
  };

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name || "Unknown";

  if (loading) return <LoadingCards count={6} />;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Menu Items"
        subtitle={`Manage ${dishes.length} dish${dishes.length !== 1 ? "es" : ""} in your menu`}
        action={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Dish
          </Button>
        }
      />

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminCard>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Dishes</p>
            <p className="text-2xl font-bold text-foreground">{dishes.length}</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</p>
            <p className="text-2xl font-bold text-emerald-600">
              {dishes.filter((d) => d.isAvailable).length}
            </p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inactive</p>
            <p className="text-2xl font-bold text-amber-600">
              {dishes.filter((d) => !d.isAvailable).length}
            </p>
          </div>
        </AdminCard>
      </div>

      {/* Dishes Table */}
      {filteredDishes.length === 0 ? (
        <AdminEmptyState
          title="No dishes found"
          description="Create your first dish or adjust your filters to see menu items."
          action={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Dish
            </Button>
          }
        />
      ) : (
        <>
          <AdminCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <AdminTableHeader
                  columns={["Dish", "Category", "Price", "Status", "Actions"]}
                />
                <tbody>
                  {paginatedDishes.map((dish) => (
                    <AdminTableRow key={dish.id}>
                      <AdminTableCell>
                        <div className="flex flex-col gap-1">
                          <p className="font-medium text-foreground">{dish.name}</p>
                          <p className="text-xs text-muted-foreground">{dish.description}</p>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <span className="text-sm text-muted-foreground">
                          {getCategoryName(dish.categoryId)}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell align="right">
                        <span className="font-semibold text-foreground">
                          ${dish.price.toFixed(2)}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell align="center">
                        <AdminBadge
                          status={dish.isAvailable ? "active" : "inactive"}
                          label={dish.isAvailable ? "Active" : "Inactive"}
                        />
                      </AdminTableCell>
                      <AdminTableCell align="center">
                        <div className="flex items-center justify-center gap-1">
                          <AdminActionButton
                            variant="ghost"
                            onClick={() => handleToggleAvailability(dish.id)}
                            title="Toggle availability"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </AdminActionButton>
                          <AdminActionButton
                            variant="ghost"
                            title="Edit dish"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </AdminActionButton>
                          <AdminActionButton
                            variant="ghost"
                            onClick={() => handleDelete(dish.id)}
                            title="Delete dish"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </AdminActionButton>
                        </div>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground px-3 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
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
