"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingCards } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { getAllAddOns, deleteAddOn } from "@/services/addOnService";
import type { AddOn } from "@/types";
import { toast } from "sonner";

export function AddOnsContent() {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddOns();
  }, []);

  const loadAddOns = async () => {
    try {
      const data = await getAllAddOns();
      setAddOns(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddOn(id);
      setAddOns(addOns.filter((a) => a.id !== id));
      toast.success("Add-on deleted");
    } catch {
      toast.error("Failed to delete add-on");
    }
  };

  if (loading) return <LoadingCards count={6} />;

  const categoryLabels: Record<string, string> = {
    sauce: "Sauce",
    topping: "Topping",
    side: "Side",
    drink: "Drink",
    dessert: "Dessert",
    custom: "Custom",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total add-ons: {addOns.length}
        </p>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Add-On
        </Button>
      </div>

      {addOns.length === 0 ? (
        <EmptyState
          title="No add-ons yet"
          description="Create add-ons for customers to customize their orders"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {addOns.map((addOn) => (
            <Card key={addOn.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{addOn.name}</p>
                  <Badge variant="outline" className="mt-1">
                    {categoryLabels[addOn.category] || addOn.category}
                  </Badge>
                  <p className="mt-2 font-medium text-primary">
                    ${addOn.price.toFixed(2)}
                  </p>
                  {!addOn.isAvailable && (
                    <Badge variant="secondary" className="mt-2">
                      Unavailable
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(addOn.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
