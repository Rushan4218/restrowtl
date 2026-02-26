"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getMenuFilters,
  addMenuFilter,
  removeMenuFilter,
  getOrderModifiers,
  addOrderModifier,
  removeOrderModifier,
} from "@/services/serviceConfigService";
import { generateId } from "@/services/api";
import type { MenuFilter, OrderModifier } from "@/types";

export function SettingsDashboardContent() {
  const [filters, setFilters] = useState<MenuFilter[]>([]);
  const [modifiers, setModifiers] = useState<OrderModifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showModifierDialog, setShowModifierDialog] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");
  const [newFilterType, setNewFilterType] = useState<"dietary" | "allergen" | "spice" | "custom">("dietary");
  const [newModifierName, setNewModifierName] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [filts, mods] = await Promise.all([
        getMenuFilters(),
        getOrderModifiers(),
      ]);
      setFilters(filts);
      setModifiers(mods);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddFilter = async () => {
    if (!newFilterName.trim()) {
      toast.error("Filter name is required");
      return;
    }

    try {
      const newFilter: MenuFilter = {
        id: generateId("f"),
        name: newFilterName,
        type: newFilterType,
      };
      const updated = await addMenuFilter(newFilter);
      setFilters(updated);
      setNewFilterName("");
      setShowFilterDialog(false);
      toast.success("Filter added successfully");
    } catch {
      toast.error("Failed to add filter");
    }
  };

  const handleRemoveFilter = async (filterId: string) => {
    try {
      const updated = await removeMenuFilter(filterId);
      setFilters(updated);
      toast.success("Filter removed");
    } catch {
      toast.error("Failed to remove filter");
    }
  };

  const handleAddModifier = async () => {
    if (!newModifierName.trim()) {
      toast.error("Modifier name is required");
      return;
    }

    try {
      const newModifier: OrderModifier = {
        id: generateId("mod"),
        name: newModifierName,
        isRequired: false,
        options: [],
      };
      const updated = await addOrderModifier(newModifier);
      setModifiers(updated);
      setNewModifierName("");
      setShowModifierDialog(false);
      toast.success("Modifier added successfully");
    } catch {
      toast.error("Failed to add modifier");
    }
  };

  const handleRemoveModifier = async (modifierId: string) => {
    try {
      const updated = await removeOrderModifier(modifierId);
      setModifiers(updated);
      toast.success("Modifier removed");
    } catch {
      toast.error("Failed to remove modifier");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Menu Filters Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-foreground">Menu Filters</CardTitle>
          <Button
            size="sm"
            onClick={() => setShowFilterDialog(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Filter
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {filters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No filters configured yet. Add filters like "Vegetarian", "Spicy", etc.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-foreground">{filter.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {filter.type}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFilter(filter.id)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Modifiers Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-foreground">Order Modifiers</CardTitle>
          <Button
            size="sm"
            onClick={() => setShowModifierDialog(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Modifier
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {modifiers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No modifiers configured yet. Add modifiers like "Size", "Toppings", etc.
            </p>
          ) : (
            <div className="space-y-3">
              {modifiers.map((modifier) => (
                <div
                  key={modifier.id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{modifier.name}</p>
                        <Badge variant={modifier.isRequired ? "default" : "outline"}>
                          {modifier.isRequired ? "Required" : "Optional"}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        {modifier.options.length > 0 ? (
                          <>
                            <p className="text-xs text-muted-foreground">
                              Options ({modifier.options.length}):
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {modifier.options.map((opt) => (
                                <Badge key={opt.id} variant="secondary" className="text-xs">
                                  {opt.name}
                                  {opt.price > 0 && ` (+$${opt.price})`}
                                </Badge>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">No options added</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveModifier(modifier.id)}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Menu Filter</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="filter-name" className="text-sm font-medium">
                Filter Name
              </Label>
              <Input
                id="filter-name"
                placeholder="e.g., Vegetarian, Spicy, Gluten-Free"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="filter-type" className="text-sm font-medium">
                Filter Type
              </Label>
              <select
                id="filter-type"
                value={newFilterType}
                onChange={(e) =>
                  setNewFilterType(
                    e.target.value as "dietary" | "allergen" | "spice" | "custom"
                  )
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="dietary">Dietary</option>
                <option value="allergen">Allergen</option>
                <option value="spice">Spice</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFilterDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddFilter}>Add Filter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Modifier Dialog */}
      <Dialog open={showModifierDialog} onOpenChange={setShowModifierDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Order Modifier</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="modifier-name" className="text-sm font-medium">
                Modifier Name
              </Label>
              <Input
                id="modifier-name"
                placeholder="e.g., Size, Toppings, Sauce"
                value={newModifierName}
                onChange={(e) => setNewModifierName(e.target.value)}
                className="mt-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              After creating the modifier, you can manage its options and pricing.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModifierDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddModifier}>Add Modifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
