"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingCards } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { getMenuSets, deleteMenuSet } from "@/services/menuSetService";
import type { MenuSet } from "@/types";
import { toast } from "sonner";

export function MenuSetsContent() {
  const [menuSets, setMenuSets] = useState<MenuSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenuSets();
  }, []);

  const loadMenuSets = async () => {
    try {
      const data = await getMenuSets();
      setMenuSets(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMenuSet(id);
      setMenuSets(menuSets.filter((m) => m.id !== id));
      toast.success("Menu set deleted");
    } catch {
      toast.error("Failed to delete menu set");
    }
  };

  if (loading) return <LoadingCards count={5} />;

  const typeLabels: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    special: "Special",
    custom: "Custom",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total menu sets: {menuSets.length}
        </p>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Menu Set
        </Button>
      </div>

      {menuSets.length === 0 ? (
        <EmptyState
          title="No menu sets yet"
          description="Create menu sets for different meal times"
        />
      ) : (
        <div className="space-y-3">
          {menuSets.map((menuSet) => (
            <Card key={menuSet.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-foreground">{menuSet.name}</p>
                <div className="mt-1 flex gap-2">
                  <Badge variant="outline">
                    {typeLabels[menuSet.type] || menuSet.type}
                  </Badge>
                  <Badge variant="outline">{menuSet.productIds.length} items</Badge>
                  {!menuSet.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(menuSet.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
